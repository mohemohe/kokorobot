const regex = require('../../../helpers/regex');
const allowCommand = require('../../../helpers/allowcommand');
const runInDocker = require('../../../helpers/runindocker');

module.exports = (robot) => {
  robot.hear(regex('/php (.*)/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace('/php', '');

    console.log('php: ---------');
    console.log(script);
    console.log('--------------');
    runInDocker(msg, 'php:alpine', script, stream);
  });
};
