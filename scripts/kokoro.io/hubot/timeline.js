const Prefix = require('../helpers/prefix');
const allowCommand = require('../helpers/allowcommand');

class Brain {
  static key(msg) {
    return `timeline_${msg.envelope.room}`;
  }

  static get(robot, msg) {
    return robot.brain.get(Brain.key(msg)) || {};
  }

  static set(robot, msg, obj) {
    robot.brain.set(Brain.key(msg), obj || {});
    robot.brain.save();
  }
}

module.exports = (robot) => {
  robot.hear(Prefix.regex('/timeline\\s*(.+)?$/mi'), (msg) => {
    const args = (msg.match ? msg.match[1] || '' : '').replace(/\s+/g, ' ').split(' ');
    if (args.length === 0) {
      return msg.send(`${Prefix.text}timeline [ add | remove | status ]`);
    }

    switch (args[0]) {
      case 'add':
        {
          if (args.length !== 2) {
            return msg.send(`${Prefix.text}timeline add [ ${Detect.isSlack ? 'roomId' : 'channelName'} ]`);
          }

          const target = Brain.get(robot, msg);
          if (target[args[1]]) {
            return msg.send(`${args[1]} は既に登録されています`);
          }
          target[args[1]] = 'all';
          Brain.set(robot, msg, target);

          return msg.send(`${args[1]} を追加しました`);
        }
      case 'remove':
        {
          if (args.length !== 2) {
            return msg.send(`${Prefix.text}timeline remove [ ${Detect.isSlack ? 'roomId' : 'channelName'} ]`);
          }

          const target = Brain.get(robot, msg);
          if (!target[args[1]]) {
            return msg.send(`${args[1]} は登録されていません`);
          }
          delete target[args[1]];
          Brain.set(robot, msg, target);
          robot.brain.save();

          return msg.send(`${args[1]} を削除しました`);
        }
      case 'status':
        {
          if (args.length !== 1) {
            return msg.send(`${Prefix.text}timeline status`);
          }

          const target = Brain.get(robot, msg);
          return msg.send(`登録済み:
${Object.keys(target).map((key) => `${key}: ${target[key]}`).join('\n')}`);
        }
      default:
        {
          return msg.send(`${Prefix.text}timeline [ add | remove | status ]`);
        }
    }
  });

  robot.hear(/.*/m, async (msg) => {
    if (msg.envelope.message.text.startsWith(`${Prefix.text}timeline`)) {
      return;
    }

    const target = Brain.get(robot, msg);

    if (Object.keys(target).length === 0) {
      return;
    }

    const channelInfo = await robot.adapter.client.web.channels.info(msg.envelope.room);
    const roomName = channelInfo.channel.name;

    Promise.all(Object.keys(target).map(async (room) => {
    robot.send({
        room,
      }, {
        as_user: false,
        username: msg.envelope.user.slack ? msg.envelope.user.slack.real_name : msg.envelope.message.rawMessage.username,
        icon_url: msg.envelope.user.slack ?
          (msg.envelope.user.slack.profile.image_512 || msg.envelope.user.slack.profile.image_128 || msg.envelope.user.slack.profile.image_64 || msg.envelope.user.slack.profile.image_48 || msg.envelope.user.slack.profile.image_32) :
          (msg.envelope.message.rawMessage.icons.image_512 || msg.envelope.message.rawMessage.icons.image_128 || msg.envelope.message.rawMessage.icons.image_64 || msg.envelope.message.rawMessage.icons.image_48 || msg.envelope.message.rawMessage.icons.image_32),
        text: `${msg.message.rawMessage.text} (at #${roomName})`,
      });
    }));
  });
}
