const Prefix = require('../../helpers/prefix');
const allowCommand = require('../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/ping$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send('pong');
  });
};
