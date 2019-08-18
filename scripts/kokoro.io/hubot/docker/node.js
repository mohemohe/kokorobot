const Prefix = require('../../helpers/prefix');
const allowCommand = require('../../helpers/allowcommand');
const runInDocker = require('../../helpers/runindocker');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/node[ \r\n]+(.*)/msi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace(`${Prefix.text}node`, '');

    console.log('node: --------');
    console.log(script);
    console.log('--------------');
    runInDocker(msg, 'node:alpine', script, stream);
  });
};
