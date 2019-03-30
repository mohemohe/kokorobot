// @ts-check

class Prefix {
  static get text() {
    let prefix = '/';
    if (process.env.KOKOROBOT_COMMAND_PREFIX && process.env.KOKOROBOT_COMMAND_PREFIX !== '') {
      prefix = process.env.KOKOROBOT_COMMAND_PREFIX;
    }
    return prefix;
  }

  static regex(/** @type string */ regexStr) {
    const re = `${regexStr}/`.split('/');
    const regex = re[1];
    const option = re[2] !== '' ? re[2] : undefined;
    return new RegExp(`^${this.text}${regex.replace(/\\/g, '\\')}`, option);
  }
}

module.exports = Prefix;
