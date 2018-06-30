util = require 'util'
Bing = require 'node-bing-api'
allowCommand = require '../helpers/allowcommand'

checkBing = (msg) ->
  if process.env.BING_API_KEY
    return new Bing({accKey: process.env.BING_API_KEY})
  else
    msg.send 'Bing Cognitive Services APIキーが設定されていません\n環境変数 BING_API_KEY に設定してください'
    return null

module.exports = (robot) ->
  robot.hear /^\/bis (.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    bing = checkBing msg
    if bing
      searchText = msg.match[1]
      bing.images searchText, {
        count: 10,
        offset: 0,
        market: 'ja-JP',
        adult: 'Moderate'
      }, (error, res, body) ->
        if error
          errorObj = util.inspect error
          console.log errorObj
          return msg.send 'APIエラーが発生しました'
        if body && body.value && body.value.length > 0
          target = getRandomInt 0, body.value.length
          console.log 'search target: ', target, body.value[target]
          msg.send body.value[target].contentUrl
        else
          return msg.send '画像が見つかりませんでした'
