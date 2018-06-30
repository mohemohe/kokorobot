MersenneTwister = require 'mersenne-twister'

module.exports = (min, max) ->
  rand = new MersenneTwister()
  min = Math.ceil min
  max = Math.floor max
  return Math.floor(rand.random() * (max - min)) + min