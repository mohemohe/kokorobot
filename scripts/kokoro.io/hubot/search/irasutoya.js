const irasutoya = require('@fand/irasutoya');
const Prefix = require('../../helpers/prefix');
const allowCommand = require('../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/irasutoya (.*)/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
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
