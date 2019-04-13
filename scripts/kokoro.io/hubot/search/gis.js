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
  robot.hear(Prefix.regex('/gis (.*)/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    const googleImage = checkGoogle(msg);
    if (googleImage) {
      const searchText = msg.match[1];
      googleImage.search(searchText).then((images) => {
        console.log(images);
        const target = random(0, images.length);
        console.log('search target: ', target, images[target]);
        msg.send(images[target].url);
      }).catch((error) => {
        console.log(error);
        msg.send('APIエラーが発生しました');
      });
    }
  });
};
