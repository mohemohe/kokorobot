const Prefix = require('../helpers/prefix');
const allowCommand = require('../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/kill$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    msg.send('😇');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};
