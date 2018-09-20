const Haiku = require('@mohemohe/haiku.js').default;

module.exports = (robot) => {
  robot.hear(/^\/ikku\s?(.*)$/mi, (msg) => {
    let status = msg.match[1];
    switch (status) {
      case 'enable':
        robot.brain.set(`kokoroio_ikku_enable_${msg.envelope.room}`, 1);
        robot.brain.save();
        msg.send('このルームの川柳検出を有効にしました');
        break;
      case 'disable':
        robot.brain.set(`kokoroio_ikku_enable_${msg.envelope.room}`, 0);
        robot.brain.save();
        msg.send('このルームの川柳検出を無効にしました');
        break;
      case 'status':
        status = robot.brain.get(`kokoroio_ikku_enable_${msg.envelope.room}`);
        if (status === 1) {
          msg.send('川柳検出は有効です');
        } else {
          msg.send('川柳検出は無効です');
        }
        break;
      default:
        break;
    }
  });

  robot.hear(/.*/, async (msg) => {
    const enable = robot.brain.get(`kokoroio_ikku_enable_${msg.envelope.room}`);
    if (enable !== 1) {
      return;
    }
    const res = await Haiku.find(msg.message.text);
    if (res.result) {
      msg.send(`🙋 ${res.haikus.length}句できました！`, ...res.haikus.map(haiku => `📝 ${haiku}`));
    }
  });
};
