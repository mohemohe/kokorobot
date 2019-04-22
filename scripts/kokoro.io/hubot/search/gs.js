const Prefix = require('../../helpers/prefix');
const GoogleImages = require('google-images');
const allowCommand = require('../../helpers/allowcommand');
const random = require('../../helpers/random');

function checkGoogle(msg) {
  if (process.env.GOOGLE_CSE_ID && process.env.GOOGLE_API_KEY) {
    return new GoogleImages(process.env.GOOGLE_CSE_ID, process.env.GOOGLE_API_KEY);
  }
  msg.send('Google Custom Search APIキーが設定されていません\n環境変数 GOOGLE_CSE_ID にIDを、 GOOGLE_API_KEY にAPIキーをそれぞれ設定してください');
  return null;
}

module.exports = (robot) => {
  robot.hear(Prefix.regex('/ifl (.*)/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send(`http://www.google.com/search?q=${encodeURIComponent(msg.match[1])}&btnI`);
  });

  robot.hear(/^(.*)\s検索$/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send(`${msg.match[1]} の検索ならこっち！ http://www.google.com/search?q=${encodeURIComponent(msg.match[1])}`);
  });
};
