allowCommand = require '../helpers/allowcommand'
runInDocker = require '../helpers/runindocker'

module.exports = (robot) ->
  robot.hear /^\/ruby(.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    input = msg.envelope.message.text
    stream = false
    if input.match /.*\/stream.*/i
      input = input.replace /\/stream/, ''
      stream = true
    script = input.replace '/ruby', ''

    console.log 'ruby: --------'
    console.log script
    console.log '--------------'
    runInDocker msg, 'ruby:alpine', script, stream
