module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/python[ \r\n]+(.*)/msi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace(`${robot.kokoro.util.prefix.text}python`, '');

    console.log('python: ------');
    console.log(script);
    console.log('--------------');
    robot.kokoro.util.runInDocker(msg, 'python:alpine', script, stream);
  });
};
