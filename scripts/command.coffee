module.exports = (robot) ->
  robot.hear /^\/command (.*)$/mi, (msg) ->
    status = msg.match[1]
    switch status
      when 'enable'
        robot.brain.set "kokoroio_room_ignore_#{msg.envelope.room}", 0
        robot.brain.save()
        return msg.send 'このルームのコマンドを有効にしました'
      when 'disable'
        robot.brain.set "kokoroio_room_ignore_#{msg.envelope.room}", 1
        robot.brain.save()
        return msg.send 'このルームのコマンドを無効にしました'
      when 'status'
        status = robot.brain.get "kokoroio_room_ignore_#{msg.envelope.room}"
        if status == 1
          return msg.send 'コマンドは無効です'
        else
          return msg.send 'コマンドは有効です'
