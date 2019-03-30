const Prefix = require('../../helpers/prefix');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/command (.*)/mi'), (msg) => {
    let status = msg.match[1];
    switch (status) {
      case 'enable':
        robot.brain.set(`kokoroio_room_ignore_${msg.envelope.room}`, 0);
        robot.brain.save();
        msg.send('このルームのコマンドを有効にしました');
        break;
      case 'disable':
        robot.brain.set(`kokoroio_room_ignore_${msg.envelope.room}`, 1);
        robot.brain.save();
        msg.send('このルームのコマンドを無効にしました');
        break;
      case 'status':
        status = robot.brain.get(`kokoroio_room_ignore_${msg.envelope.room}`);
        if (status === 1) {
          msg.send('コマンドは無効です');
        } else {
          msg.send('コマンドは有効です');
        }
        break;
      default:
        break;
    }
  });
};
