import {Robot} from "../../../../typing/kokorobot";

module.exports = (robot: Robot<any>) => {
  robot.hear(robot.kokoro.util.prefix.regex('/ping$/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    msg.send('pong');
  });
};
