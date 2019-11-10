const axios = require('axios');

module.exports = (robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/lgtm/'), async (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    try {
      // NOTE: https://github.com/lgtmapp/lgtmapp-web-extension/blob/master/app/scripts/components/App.js#L45
      const response = await axios.get('https://www.lgtm.app/api/images/random', {
        headers: {
          Accept: 'application/json',
        },
      });
      msg.send(response.data.imageURL);
    } catch (e) {
      console.log(e);
      msg.send('APIエラーが発生しました');
    }
  });
};
