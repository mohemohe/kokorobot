import {Robot, Message} from "../../typing/kokorobot";

module.exports = (robot: Robot<any>, msg: Message<any>) => {
  const deny = robot.brain.get(`kokoroio_room_ignore_${msg.envelope.room}`);

  let result = true;
  if (deny === 1) {
    result = false;
  }

  if (result) {
    console.log('command: allow');
  } else {
    console.log('command: deny');
  }

  return result;
};
