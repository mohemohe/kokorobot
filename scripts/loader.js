//@ts-check
const hubot = require('hubot');
const glob = require('glob');

module.exports = (/** @type hubot.Robot */robot) => {
  robot.kokoro = {
    util: require('../util'),
  };

  const dirs = glob.sync(`${__dirname}/*/hubot/**/`);
  dirs.forEach((dir) => robot.load(dir));
}
