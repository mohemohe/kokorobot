module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/node[ \r\n]+(.*)/msi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace(`${robot.kokoro.util.prefix.text}node`, '');

    console.log('node: --------');
    console.log(script);
    console.log('--------------');
    robot.kokoro.util.runInDocker(msg, 'node:alpine', script, stream);
  });
};
