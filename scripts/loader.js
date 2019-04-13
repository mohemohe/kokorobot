const glob = require('glob');

module.exports = (robot) => {
  const dirs = glob.sync(`${__dirname}/*/hubot/**/`);
  dirs.forEach((dir) => robot.load(dir));
}
