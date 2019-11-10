module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/php[ \r\n]+(.*)/msi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace(`${robot.kokoro.util.prefix.text}php`, '');

    console.log('php: ---------');
    console.log(script);
    console.log('--------------');
    robot.kokoro.util.runInDocker(msg, 'php:alpine', script, stream);
  });
};
