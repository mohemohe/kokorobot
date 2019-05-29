const Prefix = require('../../helpers/prefix');
const allowCommand = require('../../helpers/allowcommand');

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
