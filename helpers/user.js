module.exports = (robot, msg) => {
  switch (robot.adapterName) {
    case 'kokoro.io':
      return {
        displayName: msg.message.user.display_name,
        internalId: msg.message.user.screen_name,
      };
    case 'slack':
      return {
        displayName: msg.message.user.slack.name,
        internalId: msg.message.user.slack.id,
      };
    default:
      return {
        displayName: msg.user.name,
        internalId: msg.user.name,
      };
  }
};
