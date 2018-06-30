axios = require 'axios'
allowCommand = require '../helpers/allowcommand'

module.exports = (robot) ->
  robot.hear /^\/lgtm$/mi, (msg) ->
    if !allowCommand robot, msg
      return

    axios.get('http://lgtm.in/g', {
      headers: {
        'Accept': 'application/json',
      }
    }).then (body) ->
      return body.data
    .then (json) ->
      msg.send json.actualImageUrl
    .catch (e) ->
      msg.send 'APIエラーが発生しました'
