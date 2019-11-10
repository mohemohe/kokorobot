module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/dice(.*)/mi'), (msg) => {
    let _times;
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    const text = msg.match[1];
    console.log(text);

    let face = 6;
    let times = 1;

    if (text.match(/\d+d\d+/g)) {
      const tmp = text.split('d');
      _times = parseInt(tmp[0] || 1, 10);
      const _face = parseInt(tmp[1] || 6, 10);
      if (!_times.isNaN) {
        times = _times;
      }
      if (!_face.isNaN) {
        face = _face;
      }
    } else {
      _times = parseInt(text || 1, 10);
      if (!_times.isNaN) {
        times = _times;
      }
    }

    console.log('face:', face);
    console.log('times:', times);

    if (times >= 100000) {
      return msg.send('100000回以上は腕が疲れるので振れません');
    }

    let result = 0;
    for (let i = 0; i < times; i++) {
      const rand = robot.kokoro.util.random(1, face);
      result += rand;
    }

    msg.send(`${times}d${face}: ${result}`);
  });
};
