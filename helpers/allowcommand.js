module.exports = (robot, msg) => {
  const deny = robot.brain.get(`kokoroio_room_ignore_${msg.envelope.room}`);
  console.log(deny);

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
