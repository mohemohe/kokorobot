const axios = require('axios');
const sharp = require('sharp');

function get(url) {
  return axios({
    method: 'GET',
    url: decodeURIComponent(url),
    responseType: 'stream',
  }).then(response => response.data);
}

function resize(width, height) {
  const sharpObj = sharp();

  if (height && width) {
    sharpObj.resize(width, height);
  } else if (width) {
    sharpObj.resize(width - 0);
  } else if (height) {
    sharpObj.resize(undefined, height - 0);
  }

  sharpObj.jpeg({
    quality: 96,
  });
  return sharpObj;
}

module.exports = (robot) => {
  robot.router.get('/api/v1/image/resize', async (req, res) => {
    const { url, width, height } = req.query;
    if (!url) {
      return res.send(500);
    }
    if (!width && !height) {
      return res.send(500);
    }

    res.type('jpg');
    get(url).then(response => response.pipe(resize(width, height)).pipe(res)).catch((err) => {
      console.error(err);
      res.send(404);
    });
  });
};
