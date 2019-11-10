module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/ifl (.*)/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    msg.send(`http://www.google.com/search?q=${encodeURIComponent(msg.match[1])}&btnI`);
  });

  robot.hear(/^(.*)\s検索$/mi, (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    msg.send(`${msg.match[1]} の検索ならこっち！ http://www.google.com/search?q=${encodeURIComponent(msg.match[1])}`);
  });
};
