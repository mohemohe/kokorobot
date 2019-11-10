module.exports = (robot, msg) => {
  switch (robot.adapterName) {
    case 'kokoro.io':
      return {
        displayName: msg.message.display_name,
        internalId: msg.message.screen_name,
      };
    case 'slack':
      return {
        displayName: msg.message.user.slack.name,
        internalId: msg.message.user.slack.id,
      };
    case 'discord':
      return {
        displayName: msg.message.user.name,
        internalId: msg.message.user.id,
      };
    default:
      return {
        displayName: msg.user.name,
        internalId: msg.user.name,
      };
  }
};
