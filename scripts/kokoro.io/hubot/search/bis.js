const util = require('util');
const Bing = require('node-bing-api');

function checkBing(msg) {
  if (process.env.BING_API_KEY) {
    return new Bing({
      accKey: process.env.BING_API_KEY,
    });
  }

  msg.send('Bing Cognitive Services APIキーが設定されていません\n環境変数 BING_API_KEY に設定してください');
  return null;
}

module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/bis (.*)/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    const bing = checkBing(msg);
    if (bing) {
      const searchText = msg.match[1];
      bing.images(searchText, {
        count: 10,
        offset: 0,
        market: 'ja-JP',
        adult: 'Moderate',
      }, (error, res, body) => {
        if (error) {
          const errorObj = util.inspect(error);
          console.log(errorObj);
          msg.send('APIエラーが発生しました');
          return;
        }
        if (body && body.value && (body.value.length > 0)) {
          const target = robot.kokoro.util.random(0, body.value.length);
          console.log('search target: ', target, body.value[target]);
          msg.send(body.value[target].contentUrl);
        } else {
          msg.send('画像が見つかりませんでした');
        }
      });
    }
  });
};
