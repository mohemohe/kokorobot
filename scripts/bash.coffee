allowCommand = require '../helpers/allowcommand'
runInDocker = require '../helpers/runindocker'

module.exports = (robot) ->
  robot.hear /^\/bash(.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    input = msg.envelope.message.text
    stream = false
    if input.match /.*\/stream.*/i
      input = input.replace /\/stream/, ''
      stream = true
    script = input.replace '/bash', ''
    shellscript = """#!/bin/bash
#{script}
"""
    console.log 'sh: ----------'
    console.log shellscript
    console.log '--------------'
    runInDocker msg, 'base/archlinux', shellscript, stream
