childProcess = require 'child_process'

module.exports = (msg, image, script, stream) ->
  stdout = ''
  stderr = ''
  streamHandler = null
  timeoutHandler = null
  splitNum = 20
  lock = false

  startStreamTimer = () ->
    streamHandler = setInterval ( ->
      _stdout = stdout.trim()
      _stderr = stderr.trim()
      stdout = ''
      stderr = ''
      if !_stdout.match(/^\n*$/) || !_stderr.match(/^\n*$/)
        console.log 'stdout:', _stdout
        console.log 'stderr:', _stderr
        msg.send """STDOUT (partial)

```
#{_stdout}
```

STDERR (partial)

```
#{_stderr}
```"""
    ), 3 * 1000

  sendPartial = (out, err, finalize) ->
    console.log 'sendPartial'
    _stdout = out.split "\n"
    _stderr = err.split "\n"
    waitLockHandler = null

    send = () ->
      if _stdout.length > splitNum || _stderr.length > splitNum
        lock = true
        postHandler = null
        postHandler = setInterval ( ->
          __stdout = _stdout.slice(0, splitNum).join("\n")
          __stderr = _stderr.slice(0, splitNum).join("\n")
          _stdout.splice(0, splitNum)
          _stderr.splice(0, splitNum)
          if __stdout.length > 0 || __stderr.length > 0
            msg.send """STDOUT (partial)

```
#{__stdout}
```

STDERR (partial)

```
#{__stderr}
```"""
          else if (finalize)
            clearInterval postHandler
            msg.send "DONE."
            lock = false
          else
            clearInterval postHandler
            if streamHandler
              clearInterval streamHandler
            if stream
              startStreamTimer
            lock = false
        ), 1000
      else if _stdout.length < splitNum && _stderr.length < splitNum && finalize
        msg.send """STDOUT

```
#{_stdout.join '\n'}
```

STDERR

```
#{_stderr.join '\n'}
```

DONE."""

    if lock
      waitLockHandler = setInterval ( ->
        console.log "write locked. wait 100ms."
        if (!lock)
          clearInterval waitLockHandler
          send()
      ), 100
    else
      send()

  cp = childProcess.spawn 'docker', ['run', '--rm', '-i', '--network', 'none', image], {stdio: 'pipe'}
  timeoutHandler = setTimeout ( ->
    cp.kill()
    msg.send "TIMEOUT!"
  ), 3 * 60 * 1000
  cp.stdout.on 'data', (data) ->
    stdout += data
    if stdout.split("\n").length > splitNum
      if streamHandler
        clearInterval streamHandler
      _stdout = stdout.trim()
      _stderr = stderr.trim()
      stdout = ''
      stderr = ''
      sendPartial(_stdout, _stderr, false)
      if stream
        startStreamTimer
  cp.stderr.on 'data', (data) ->
    stderr += data
    if stdout.split("\n").length > splitNum
      if streamHandler
        clearInterval streamHandler
      _stdout = stdout.trim()
      _stderr = stderr.trim()
      stdout = ''
      stderr = ''
      sendPartial(_stdout, _stderr, false)
      if stream
        startStreamTimer

  if stream
    streamHandler = setInterval ( ->
      _stdout = stdout.trim()
      _stderr = stderr.trim()
      stdout = ''
      stderr = ''
      if !_stdout.match(/^\n*$/) || !_stderr.match(/^\n*$/)
        console.log 'stdout:', _stdout
        console.log 'stderr:', _stderr
        sendPartial(_stdout, _stderr, false)
    ), 3 * 1000

  cp.on 'close', (code) ->
    if streamHandler
      clearInterval streamHandler
    if timeoutHandler
      clearTimeout timeoutHandler
    sendPartial(stdout, stderr, true)

  cp.stdin.setEncoding 'utf8'
  cp.stdin.write script
  cp.stdin.end()
  cp.unref()
