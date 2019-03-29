const regex = require('../../helpers/regex');
const allowCommand = require('../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(regex('/kill$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send('😇');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};
