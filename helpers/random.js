const MersenneTwister = require('mersenne-twister');

module.exports = (min, max) => {
  const rand = new MersenneTwister();
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(rand.random() * (floorMax - ceilMin)) + ceilMin;
};
