module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/kill$/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    msg.send('😇');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};
