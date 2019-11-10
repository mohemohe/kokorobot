module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/bash[ \r\n]+(.*)/msi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    let input = msg.envelope.message.text;
    let stream = false;
    if (input.match(/.*\/stream.*/i)) {
      input = input.replace(/\/stream/, '');
      stream = true;
    }
    const script = input.replace(`${robot.kokoro.util.prefix.text}bash`, '');
    const shellscript = `#!/bin/bash
${script}
`;
    console.log('sh: ----------');
    console.log(shellscript);
    console.log('--------------');
    robot.kokoro.util.runInDocker(msg, 'archlinux/base', shellscript, stream);
  });
};
