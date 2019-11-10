const irasutoya = require('@fand/irasutoya');

module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/irasutoya (.*)/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    const searchText = msg.match[1];
    irasutoya(searchText).then((url) => {
      msg.send(url);
    }).catch((error) => {
      console.log(error);
      msg.send('APIエラーが発生しました');
    });
  });
};
