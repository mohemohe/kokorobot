import {Robot} from "../../typing/kokorobot";
import * as glob from "glob";

module.exports = (robot: Robot<any>) => {
  robot.kokoro = {
    util: require('../util'),
  };

  const dirs = glob.sync(`${__dirname}/*/hubot/**/`);
  dirs.forEach((dir) => robot.load(dir));
}
