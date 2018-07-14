const allowCommand = require('../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(/^\/ping$/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send('pong');
  });
};
