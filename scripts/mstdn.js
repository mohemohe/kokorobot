const Mastodon = require('mastodon-api');
const allowCommand = require('../helpers/allowcommand');

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

    console.log(msg.data);

    const rooms = this.robot.brain.get('kokoroio_mstdn') || {};
    Object.keys(rooms).forEach((room) => {
      const track = this.robot.brain.get(`kokoroio_mstdn_${room}`) || {};
      Object.keys(track).filter(key => Mstdn.unescape(key) === msg.data.account.acct).forEach(() => {
        const tootUri = msg.data.uri || '';
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
    if (args.length !== 2) {
      msg.reply('/mstdn add [name@instance]');
      return;
    }

    this.mstdn.post('follows', {
      uri: args[1],
    }).then(resp => resp.data).then((data) => {
      if (!data || !data.id) {
        msg.reply(`${args[1]} さんの追加に失敗しました（鍵垢かも？）`);
      } else {
        const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
        acct[Mstdn.escape(data.acct)] = true;
        this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, acct);

        const track = this.robot.brain.get('kokoroio_mstdn') || {};
        track[msg.message.room] = true;
        this.robot.brain.set('kokoroio_mstdn', track);
        this.robot.brain.save();

        msg.reply(`${args[1]} さんを追加しました`);
      }
    }).catch((err) => {
      msg.reply(`${args[1]} さんの追加に失敗しました（鍵垢かも？）`);
      console.log(err);
    });
  }

  remove(msg) {
    const args = msg.match[1].split(' ');
    if (args.length !== 2) {
      msg.reply('/mstdn remove [name@instance]');
      return;
    }

    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    delete acct[Mstdn.escape(args[1])];
    this.robot.brain.set(`kokoroio_mstdn_${msg.message.room}`, acct);

    msg.reply(`${args[1]} さんを削除しました`);
  }

  list(msg) {
    const acct = this.robot.brain.get(`kokoroio_mstdn_${msg.message.room}`) || {};
    msg.reply(`\`\`\`${Object.keys(acct).map(_ => Mstdn.unescape(_)).join('\n')}\`\`\``);
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
      case 'reconnect':
        mstdn.reconnect(msg);
        break;
      default:
        msg.reply('/mstdn [status|auth|add|remove|list|reconnect]');
        break;
    }
  });
};
