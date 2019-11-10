import Mastodon, {StreamListener, Status} from "megalodon";
import {Robot, Response} from "../../../../typing/kokorobot";

const Mode = {
  ALL: 'all',
  IMAGE: 'image',
};

class Mstdn {
  private mstdn: Mastodon;
  private listener: StreamListener | null;
  private robot: Robot<any>;

  constructor(apiUrl: string, accessToken: string, robot: Robot<any>) {
    this.mstdn = new Mastodon(accessToken, apiUrl);
    this.robot = robot;

    this.listener = null;
    this._connect();
  }

  _connect() {
    if (this.listener) {
      try {
        this.listener.off('update', msg => this._onStreamMessage(msg));
        this.listener.off('error', err => this._onStreamMessage(err));
      } catch (e) {
        console.log(e);
      } finally {
        this.listener = null;
      }
    }
    this.listener = this.mstdn.stream('/api/v1/streaming/user', 10);
    if (this.listener) {
      console.log('mastodon userstream connected');
      this.listener.on('update', msg => this._onStreamMessage(msg));
      this.listener.on('error', err => this._onStreamMessage(err));
    }
  }

  _onStreamMessage(msg: Status) {
    const rooms = this.robot.brain.get('kokoroio_mstdn') || {};
    Object.keys(rooms).forEach((room) => {
      const track = this.robot.brain.get(`kokoroio_mstdn_${room}`) || {};
      Object.keys(track).filter(key => Mstdn.unescape(key) === msg.account.acct).forEach(() => {
        const acct = Mstdn.escape(msg.account.acct);
        console.log('mode:', track[acct]);
        if (track[acct] === Mode.IMAGE && (msg.media_attachments || []).length === 0) {
          return;
        }

        console.log(msg);

        const tootUri = msg.url || msg.uri || '';
        this.robot.send({
          room,
        }, `@${msg.account.acct} の${msg.reblog ? 'ブースト' : 'トゥート'}: ${tootUri.replace(/\/activity$/, '')}`);
      });
    });
  }

  _onStreamError(err: Error) {
    console.log(err);
    this.reconnect();
  }

  status(msg: Response<any>) {
    if (this.listener) {
      msg.reply(`\`${process.env.MASTODON_BASE_URL}/api/v1/streaming/user\`に接続しています`);
    } else {
      msg.reply(`\`${process.env.MASTODON_BASE_URL}/api/v1/streaming/user\`に接続していません`);
    }
  }

  add(msg: Response<any>) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2 && args.length !== 3) {
      msg.reply(`${robot.kokoro.util.prefix.text}mstdn add [name@instance|toot_url] [all|image]`);
      return;
    }

    let target = args[1];
    if (target.startsWith('@')) {
      target = target.substring(1);
    }

    // FIXME: コピペ
    if (target.startsWith('https://') || target.startsWith('http://')) {
      const match = target.match(/https?:\/\/(.*?)\/@?(.*?)\/.*/);
      if (match.length === 3 && match[1] !== '' && match[2] !== '') {
        target = `${match[2]}@${match[1]}`;
      }
    }

    let mode = Mode.ALL;
    if (args.length === 3) {
      switch (args[2]) {
        case 'image':
          mode = Mode.IMAGE;
          break;
        default:
          // NOP
          break;
      }
    }

    console.log("follow:", target)

    let acct;

    this.mstdn.get(`/api/v2/search?q=@${target}&resolve=true&limit=1`).then(resp => {
      console.log(`/api/v2/search?q=@${target}&resolve=true&limit=1`, resp)
      return resp.data;
    }).then(data => {
      if (data.accounts.length === 0) {
        msg.reply(`${target} さんはFediverseに存在しません`);
        throw new Error("INTERNAL");
      }
      return data.accounts[0];
    }).then(account => {
      acct = account.acct;
      return this.mstdn.post(`/api/v1/accounts/${account.id}/follow`);
    }).then(resp => {
      return resp.data;
    }).then((data) => {
      console.log(`/api/v1/accounts/:id/follow`, data);
      if (data.following) {
        msg.reply(`${target} さんを追加しました`);
      } else if (data.blocked_by) {
        msg.reply(`${target} さんの追加に失敗しました（ブロックされています）`);
      } else if (data.requested) {
        msg.reply(`${target} さんにフォローリスエストを送りました（鍵垢です）`);
      }

      const room = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
      room[Mstdn.escape(acct)] = mode;
      this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, room);

      const track = this.robot.brain.get('kokoroio_mstdn') || {};
      track[msg.message.room] = mode;
      this.robot.brain.set('kokoroio_mstdn', track);
      this.robot.brain.save();

    }).catch((err) => {
      if (err.message !== "INTERNAL") {
        msg.reply(`${target} さんの追加に失敗しました（ブロックされてるかも？）`);
        console.log(err);
      }
    });
  }

  remove(msg: Response<any>) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2) {
      msg.reply(`${robot.kokoro.util.prefix.text}mstdn remove [name@instance|toot_url]`);
      return;
    }

    let target = args[1];
    if (target.startsWith('@')) {
      target = target.substring(1);
    }

    // FIXME: コピペ
    if (target.startsWith('https://') || target.startsWith('http://')) {
      const match = target.match(/https?:\/\/(.*?)\/@?(.*?)\/.*/);
      if (match.length === 3 && match[1] !== '' && match[2] !== '') {
        target = `${match[2]}@${match[1]}`;
      }
    }

    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    delete acct[Mstdn.escape(target)];
    this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, acct);

    msg.reply(`${target} さんを削除しました`);
  }

  list(msg: Response<any>) {
    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    const screenNames = Object.keys(acct);
    if (screenNames.length === 0) {
      msg.reply('登録されていません');
      return;
    }
    let count = 0;
    let page = [];
    screenNames.forEach((screenName) => {
      // FIXME: 何度も使ってる気がするから切り出したほうが良さげ
      let mode = Mode.ALL;
      switch (acct[screenName]) {
        case Mode.IMAGE:
          mode = Mode.IMAGE;
          break;
        default:
          // NOP
          break;
      }

      const line = `${Mstdn.unescape(screenName)}: ${mode}`;
      count += line.length;
      page.push(line);

      if (count > 2500) {
        msg.reply(`

\`\`\`
${page.join('\n')}
\`\`\``);
        count = 0;
        page = [];
      }
    });

    if (count > 0) {
      msg.reply(`

\`\`\`
${page.join('\n')}
\`\`\``);
    }
  }

  find(msg: Response<any>) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2) {
      msg.reply(`${this.robot.kokoro.util.prefix.text}mstdn find [name@instance|toot_url]`);
      return;
    }

    let target = args[1];
    if (target.startsWith('@')) {
      target = target.substring(1);
    }

    // FIXME: コピペ
    if (target.startsWith('https://') || target.startsWith('http://')) {
      const match = target.match(/https?:\/\/(.*?)\/@?(.*?)\/.*/);
      if (match.length === 3 && match[1] !== '' && match[2] !== '') {
        target = `${match[2]}@${match[1]}`;
      }
    }

    const dbTarget = Mstdn.escape(target);
    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    let mode = Mode.ALL;
    switch (acct[dbTarget]) {
      case Mode.IMAGE:
        mode = Mode.IMAGE;
        break;
      default:
        // NOP
        break;
    }
    msg.reply(`

\`\`\`
${Mstdn.unescape(dbTarget)}: ${mode}
\`\`\``);
  }

  reconnect(msg?: Response<any>) {
    this._connect();
    if (msg) {
      msg.reply(`\`${process.env.MASTODON_BASE_URL}/api/v1/streaming/user\`に再接続しました`);
    }
  }

  static escape(text: string) {
    return text.replace(/\./g, '__DOT__');
  }

  static unescape(text: string) {
    return text.replace(/__DOT__/g, '.');
  }
}

module.exports = (robot: Robot<any>) => {
  let mstdn;
  if (process.env.MASTODON_BASE_URL && process.env.MASTODON_ACCESS_TOKEN) {
    mstdn = new Mstdn(process.env.MASTODON_BASE_URL, process.env.MASTODON_ACCESS_TOKEN, robot);
  }

  robot.hear(robot.kokoro.util.prefix.regex('/mstdn\\s*(.*)$/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    if (!mstdn) {
      msg.reply('`マストドン API URL`または`マストドン アクセストークン`が設定されていません\n環境変数`MASTODON_BASE_URL`と`MASTODON_ACCESS_TOKEN`に設定してください');
    }

    const mode = msg.match[1].split(' ')[0];
    switch (mode) {
      case 'status':
        mstdn.status(msg);
        break;
      case 'add':
        mstdn.add(msg);
        break;
      case 'remove':
        mstdn.remove(msg);
        break;
      case 'list':
        mstdn.list(msg);
        break;
      case 'find':
        mstdn.find(msg);
        break;
      case 'reconnect':
        mstdn.reconnect(msg);
        break;
      default:
        msg.reply(`${robot.kokoro.util.prefix.text}mstdn [status|auth|add|remove|list|find|reconnect]`);
        break;
    }
  });
};
