const Mastodon = require('mastodon-api');
const allowCommand = require('../helpers/allowcommand');

const Mode = {
  ALL: "all",
  IMAGE: "image",
}

class Mstdn {
  constructor(apiUrl, accessToken, robot) {
    this.mstdn = new Mastodon({
      api_url: apiUrl,
      access_token: accessToken,
    });
    this.robot = robot;

    this.listener = null;
    this._connect();
  }

  _connect() {
    if (this.listener) {
      try {
        this.listener.off('message', msg => this._onStreamMessage(msg));
        this.listener.off('error', err => this._onStreamMessage(err));
      } catch (e) {
        console.log(e);
      } finally {
        this.listener = null;
      }
    }
    this.listener = this.mstdn.stream('streaming/user');
    this.listener.on('message', msg => this._onStreamMessage(msg));
    this.listener.on('error', err => this._onStreamMessage(err));
  }

  _onStreamMessage(msg) {
    if (msg.event !== 'update') {
      console.log(msg);
      return;
    }

    const rooms = this.robot.brain.get('kokoroio_mstdn') || {};
    Object.keys(rooms).forEach((room) => {
      const track = this.robot.brain.get(`kokoroio_mstdn_${room}`) || {};
      Object.keys(track).filter(key => Mstdn.unescape(key) === msg.data.account.acct).forEach(() => {
        const acct = Mstdn.escape(msg.data.account.acct)
        console.log("mode:", track[acct])
        if (track[acct] === Mode.IMAGE && (msg.data.media_attachments || []).length === 0) {
          return;
        }

        console.log(msg.data);

        const tootUri = msg.data.url || msg.data.uri || '';
        this.robot.send({
          room,
        }, `@${msg.data.account.acct} の${msg.data.reblog ? 'ブースト' : 'トゥート'}: ${tootUri.replace(/\/activity$/, '')}`);
      });
    });
  }

  _onStreamError(err) {
    console.log(err);
    this.reconnect();
  }

  status(msg) {
    if (this.listener) {
      msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に接続しています`);
    } else {
      msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に接続していません`);
    }
  }

  add(msg) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2 && args.length !== 3) {
      msg.reply('/mstdn add [name@instance|toot_url] [all|image]');
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
        target = `${match[2]}@${match[1]}`
      }
    }

    let mode = Mode.ALL;
    if (args.length === 3) {
      switch (args[2]) {
        case 'image':
          mode = Mode.IMAGE;
          break;
      }
    }

    this.mstdn.post('follows', {
      uri: target,
    }).then(resp => resp.data).then((data) => {
      if (!data || !data.id) {
        msg.reply(`${target} さんの追加に失敗しました（鍵垢かも？）`);
      } else {
        const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
        acct[Mstdn.escape(data.acct)] = mode;
        this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, acct);

        const track = this.robot.brain.get('kokoroio_mstdn') || {};
        track[msg.message.room] = mode;
        this.robot.brain.set('kokoroio_mstdn', track);
        this.robot.brain.save();

        msg.reply(`${target} さんを追加しました`);
      }
    }).catch((err) => {
      msg.reply(`${target} さんの追加に失敗しました（鍵垢かも？）`);
      console.log(err);
    });
  }

  remove(msg) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2) {
      msg.reply('/mstdn remove [name@instance|toot_url]');
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
        target = `${match[2]}@${match[1]}`
      }
    }

    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    delete acct[Mstdn.escape(target)];
    this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, acct);

    msg.reply(`${target} さんを削除しました`);
  }

  list(msg) {
    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    msg.reply(`

\`\`\`
${
      Object.keys(acct).map(screenName => {
        // FIXME: 何度も使ってる気がするから切り出したほうが良さげ
        let mode = Mode.ALL;
        switch (acct[screenName]) {
          case Mode.IMAGE:
            mode = Mode.IMAGE;
            break;
        }

        return `${Mstdn.unescape(screenName)}: ${mode}`;
      }).join('\n')
}
\`\`\``);
  }

  find(msg) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2) {
      msg.reply('/mstdn find [name@instance|toot_url]');
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
        target = `${match[2]}@${match[1]}`
      }
    }

    const dbTarget = Mstdn.escape(target);

    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    msg.reply(`

\`\`\`
${
      (() => {
        let mode = Mode.ALL;
        switch (acct[dbTarget]) {
          case Mode.IMAGE:
            mode = Mode.IMAGE;
            break;
        }

        return `${Mstdn.unescape(target)}: ${mode}`;
      }).join('\n')
}
\`\`\``);
  }

  reconnect(msg) {
    this._connect();
    msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に再接続しました`);
  }

  static escape(text) {
    return text.replace(/\./g, '__DOT__');
  }

  static unescape(text) {
    return text.replace(/__DOT__/g, '.');
  }
}

module.exports = (robot) => {
  let mstdn;
  if (process.env.MASTODON_API_URL && process.env.MASTODON_ACCESS_TOKEN) {
    mstdn = new Mstdn(process.env.MASTODON_API_URL, process.env.MASTODON_ACCESS_TOKEN, robot);
  }

  robot.hear(/^\/mstdn\s*(.*)$/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    if (!mstdn) {
      msg.reply('`マストドン API URL`または`マストドン アクセストークン`が設定されていません\n環境変数`MASTODON_API_URL`と`MASTODON_ACCESS_TOKEN`に設定してください');
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
        msg.reply('/mstdn [status|auth|add|remove|list|find|reconnect]');
        break;
    }
  });
};
