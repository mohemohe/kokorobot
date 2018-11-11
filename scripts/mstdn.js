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
    this.listener = this.mstdn.stream('streaming/user');
    this.listener.on('message', msg => this._onStreamMessage(msg));
    this.listener.on('error', err => this._onStreamMessage(err));
  }

  _onStreamMessage(msg) {
    console.log(msg);

    // TODO: impl
  }

  _onStreamError(err) {
    console.log(err);
  }

  _addUser() {
    // TODO: impl
  }

  _removeUser() {
    // TODO: impl
  }

  status(msg) {
    if (this.listener) {
      msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に接続しています`);
    } else {
      msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に接続していません`);
    }
  }

  add(msg) {
    // TODO: impl

    msg.reply('not implemented');
  }

  remove(msg) {
    // TODO: impl

    msg.reply('not implemented');
  }

  list(msg) {
    // TODO: impl

    msg.reply('not implemented');
  }

  reconnect(msg) {
    this._connect();
    msg.reply(`\`${process.env.MASTODON_API_URL}streaming/user\`に再接続しました`);
  }
}

module.exports = (robot) => {
  let mstdn;
  if (process.env.MASTODON_API_URL && process.env.MASTODON_ACCESS_TOKEN) {
    mstdn = new Mstdn(process.env.MASTODON_API_URL, process.env.MASTODON_ACCESS_TOKEN, robot);
  }

  robot.hear(/^\/mstdn\s*(.*?)$/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    if (!mstdn) {
      msg.reply('`マストドン API URL`または`マストドン アクセストークン`が設定されていません\n環境変数`MASTODON_API_URL`と`MASTODON_ACCESS_TOKEN`に設定してください')
    }


    const mode = msg.match[1];
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
      case 'reconnect':
        mstdn.reconnect(msg);
        break;
      default:
        msg.reply('/mstdn [status|auth|add|remove|list|reconnect]');
        break;
    }
  });
};
