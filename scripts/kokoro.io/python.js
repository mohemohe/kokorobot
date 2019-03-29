const allowCommand = require('../../helpers/allowcommand');
const runInDocker = require('../../helpers/runindocker');

module.exports = (robot) => {
  robot.hear(/^\/python(.*)/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace('/python', '');

    console.log('python: ------');
    console.log(script);
    console.log('--------------');
    runInDocker(msg, 'python:alpine', script, stream);
  });
};
