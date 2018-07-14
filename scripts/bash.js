const allowCommand = require('../helpers/allowcommand');
const runInDocker = require('../helpers/runindocker');

module.exports = (robot) => {
  robot.hear(/^\/bash(.*)/mi, (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace('/bash', '');
    const shellscript = `#!/bin/bash
${script}
`;
    console.log('sh: ----------');
    console.log(shellscript);
    console.log('--------------');
    runInDocker(msg, 'base/archlinux', shellscript, stream);
  });
};
