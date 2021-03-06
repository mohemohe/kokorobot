const childProcess = require('child_process');

module.exports = (msg, image, script, stream) => {
  let stdout = '';
  let stderr = '';
  let streamHandler = null;
  let timeoutHandler = null;
  const splitNum = 20;
  let lock = false;

  const genMsg = (isPartial, so, se) => {
    const res = [];
    if (so !== '') {
      res.push(`STDOUT${isPartial ? ' (partial)' : ''}
\`\`\`
${so}
\`\`\``);
    }
    if (se !== '') {
      res.push(`STDERR${isPartial ? ' (partial)' : ''}
\`\`\`
${se}
\`\`\``);
    }
    return res.join('\n');
  };

  const startStreamTimer = () => {
    streamHandler = setInterval(() => {
      const _stdout = stdout.trim();
      const _stderr = stderr.trim();
      stdout = '';
      stderr = '';
      if (!_stdout.match(/^\n*$/) || !_stderr.match(/^\n*$/)) {
        console.log('stdout:', _stdout);
        console.log('stderr:', _stderr);
        return msg.send(genMsg(true, _stdout, _stderr));
      }
    }, 3 * 1000);
  };

  const sendPartial = (out, err, finalize) => {
    console.log('sendPartial');
    const _stdout = out.split('\n');
    const _stderr = err.split('\n');
    let waitLockHandler = null;

    const send = () => {
      if ((_stdout.length > splitNum) || (_stderr.length > splitNum)) {
        lock = true;
        let postHandler = null;
        postHandler = setInterval(() => {
          const __stdout = _stdout.slice(0, splitNum).join('\n');
          const __stderr = _stderr.slice(0, splitNum).join('\n');
          _stdout.splice(0, splitNum);
          _stderr.splice(0, splitNum);
          if ((__stdout.length > 0) || (__stderr.length > 0)) {
            msg.send(genMsg(true, __stdout, __stderr));
          } else if (finalize) {
            clearInterval(postHandler);
            msg.send('DONE.');
            lock = false;
          } else {
            clearInterval(postHandler);
            if (streamHandler) {
              clearInterval(streamHandler);
            }
            if (stream) {
              startStreamTimer();
            }
            lock = false;
          }
        }, 1000);
      } else if ((_stdout.length < splitNum) && (_stderr.length < splitNum) && finalize) {
        const lastStdout = _stdout.pop();
        if (lastStdout.length !== 0) {
          _stdout.push(lastStdout);
        }
        const lastStderr = _stderr.pop();
        if (lastStderr.length !== 0) {
          _stderr.push(lastStderr);
        }
        return msg.send(genMsg(false, _stdout.join('\n'), _stderr.join('\n')));
      }
    };

    if (lock) {
      waitLockHandler = setInterval((() => {
        console.log('write locked. wait 100ms.');
        if (!lock) {
          clearInterval(waitLockHandler);
          return send();
        }
      }), 100);
    } else {
      return send();
    }
  };

  let spawnArgs = ['run', '--rm', '-i', '--network', 'none', '--log-driver', 'none', image];
  if (process.env.KOKOROBOT_ALLOW_DOCKER_NETWORK && process.env.KOKOROBOT_ALLOW_DOCKER_NETWORK === 'true') {
    spawnArgs = ['run', '--rm', '-i', '--log-driver', 'none', image];
  }
  const cp = childProcess.spawn('docker', spawnArgs, { stdio: 'pipe' });
  timeoutHandler = setTimeout((() => {
    cp.kill();
    return msg.send('TIMEOUT!');
  }), 3 * 60 * 1000);
  cp.stdout.on('data', (data) => {
    stdout += data;
    if (stdout.split('\n').length > splitNum) {
      if (streamHandler) {
        clearInterval(streamHandler);
      }
      const _stdout = stdout.trim();
      const _stderr = stderr.trim();
      stdout = '';
      stderr = '';
      sendPartial(_stdout, _stderr, false);
      if (stream) {
        return startStreamTimer;
      }
    }
  });
  cp.stderr.on('data', (data) => {
    stderr += data;
    if (stdout.split('\n').length > splitNum) {
      if (streamHandler) {
        clearInterval(streamHandler);
      }
      const _stdout = stdout.trim();
      const _stderr = stderr.trim();
      stdout = '';
      stderr = '';
      sendPartial(_stdout, _stderr, false);
      if (stream) {
        return startStreamTimer;
      }
    }
  });

  if (stream) {
    streamHandler = setInterval((() => {
      const _stdout = stdout.trim();
      const _stderr = stderr.trim();
      stdout = '';
      stderr = '';
      if (!_stdout.match(/^\n*$/) || !_stderr.match(/^\n*$/)) {
        console.log('stdout:', _stdout);
        console.log('stderr:', _stderr);
        return sendPartial(_stdout, _stderr, false);
      }
    }), 3 * 1000);
  }

  cp.on('close', () => {
    if (streamHandler) {
      clearInterval(streamHandler);
    }
    if (timeoutHandler) {
      clearTimeout(timeoutHandler);
    }
    return sendPartial(stdout, stderr, true);
  });

  cp.stdin.setEncoding('utf8');
  cp.stdin.write(script);
  cp.stdin.end();
  return cp.unref();
};
