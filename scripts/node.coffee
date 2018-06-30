allowCommand = require '../helpers/allowcommand'
runInDocker = require '../helpers/runindocker'

module.exports = (robot) ->
  robot.hear /^\/node(.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    input = msg.envelope.message.text
    stream = false
    if input.match /.*\/stream.*/i
      input = input.replace /\/stream/, ''
      stream = true
    script = input.replace '/node', ''

    console.log 'node: --------'
    console.log script
    console.log '--------------'
    runInDocker msg, 'node:alpine', script, stream
