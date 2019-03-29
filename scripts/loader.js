const glob = require('glob');

module.exports = (robot) => {
    const dirs = glob.sync(`${__dirname}/**/*/`);
    dirs.forEach((dir) => robot.load(dir));
}