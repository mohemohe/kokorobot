const axios = require('axios');
const Prefix = require('../../../helpers/prefix');
const allowCommand = require('../../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/lgtm/'), async (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    try {
      const response = await axios.get('http://lgtm.in/g', {
        headers: {
          Accept: 'application/json',
        },
      });
      msg.send(response.body.data.actualImageUrl);
    } catch (e) {
      console.log(e);
      msg.send('APIエラーが発生しました');
    }
  });
};
