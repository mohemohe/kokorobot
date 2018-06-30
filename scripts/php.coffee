allowCommand = require '../helpers/allowcommand'
runInDocker = require '../helpers/runindocker'

module.exports = (robot) ->
  robot.hear /^\/php(.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    input = msg.envelope.message.text
    stream = false
    if input.match /.*\/stream.*/i
      input = input.replace /\/stream/, ''
      stream = true
    script = input.replace '/php', ''

    console.log 'php: ---------'
    console.log script
    console.log '--------------'
    runInDocker msg, 'php:alpine', script, stream
