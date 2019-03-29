const regex = require('../../../helpers/regex');
const allowCommand = require('../../../helpers/allowcommand');
const runInDocker = require('../../../helpers/runindocker');

module.exports = (robot) => {
  robot.hear(regex('/ruby (.*)/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace('/ruby', '');

    console.log('ruby: --------');
    console.log(script);
    console.log('--------------');
    runInDocker(msg, 'ruby:alpine', script, stream);
  });
};
