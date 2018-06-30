irasutoya = require '@fand/irasutoya'
allowCommand = require '../helpers/allowcommand'

module.exports = (robot) ->
  robot.hear /^\/irasutoya (.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    searchText = msg.match[1]
    irasutoya(searchText).then (url) ->
      msg.send url
    .catch (error) ->
      return msg.send 'APIエラーが発生しました'
