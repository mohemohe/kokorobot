GoogleImages = require 'google-images'
allowCommand = require '../helpers/allowcommand'
random = require '../helpers/random'

checkGoogle = (msg) ->
  if process.env.GOOGLE_CSE_ID && process.env.GOOGLE_API_KEY
    return new GoogleImages(process.env.GOOGLE_CSE_ID, process.env.GOOGLE_API_KEY)
  else
    msg.send 'Google Custom Search APIキーが設定されていません\n環境変数 GOOGLE_CSE_ID にIDを、 GOOGLE_API_KEY にAPIキーをそれぞれ設定してください'
    return null

module.exports = (robot) ->
  robot.hear /^\/gis (.*)/mi, (msg) ->
    if !allowCommand robot, msg
      return

    googleImage = checkGoogle msg
    if googleImage
      searchText = msg.match[1]
      googleImage.search(searchText).then (images) ->
        console.log images
        target = random 0, images.length
        console.log 'search target: ', target, images[target]
        return msg.send images[target].url
      .catch (error) ->
        return msg.send 'APIエラーが発生しました'
