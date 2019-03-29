const regex = require('../../helpers/regex');
const allowCommand = require('../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(regex('/ping$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send('pong');
  });
};
