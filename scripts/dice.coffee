random = require '../helpers/random'
allowCommand = require '../helpers/allowcommand'

module.exports = (robot) ->
  robot.hear /^\/dice(.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    text = msg.match[1]
    console.log text

    face = 6
    times = 1

    if text.match(/\d+d\d+/g)
      tmp = text.split 'd'
      _times = parseInt tmp[0] || 1
      _face = parseInt tmp[1] || 6
      if ! _times.isNaN
        times = _times
      if ! _face.isNaN
        face = _face
    else
      _times = parseInt text || 1
      if ! _times.isNaN
        times = _times

    console.log 'face:', face
    console.log 'times:', times

    if times > 1000
      return msg.send '1000回以上は腕が疲れるので振れません'

    result = 0
    for i in [1..times]
      rand = random 1, face
      result += rand

    msg.send "#{times}d#{face}: #{result}"
