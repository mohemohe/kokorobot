const Haiku = require('@mohemohe/haiku.js').default;

module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/ikku(.*)$/mi'), (msg) => {
    const command = msg.match[1].trim();
    const status = robot.brain.get(`kokoroio_ikku_enable_${msg.envelope.room}`);
    switch (command) {
      case 'enable':
        if (status === 1) {
          msg.send('このチャンネルの川柳検出は既に有効です');
        } else {
          robot.brain.set(`kokoroio_ikku_enable_${msg.envelope.room}`, 1);
          robot.brain.save();
          msg.send('このチャンネルの川柳検出を有効にしました');
        }
        break;
      case 'disable':
        if (status === 1) {
          robot.brain.set(`kokoroio_ikku_enable_${msg.envelope.room}`, 0);
          robot.brain.save();
          msg.send('このチャンネルの川柳検出を無効にしました');
        } else {
          msg.send('このチャンネルの川柳検出は既に無効です');
        }
        break;
      case 'status':
        if (status === 1) {
          msg.send('このチャンネルの川柳検出は有効です');
        } else {
          msg.send('このチャンネルの川柳検出は無効です');
        }
        break;
      default:
        msg.send('/ikku [enable|disable|status]');
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
