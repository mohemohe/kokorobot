/// <reference path="../../../typings/kokorobot">

module.exports = (/** @type KokoroBot.Robot<any> */ robot) => {
  robot.hear(robot.kokoro.util.prefix.regex('/help$/mi'), (msg) => {
    if (!robot.kokoro.util.allowCommand(robot, msg)) {
      return;
    }

    const help = `\`\`\`
${robot.kokoro.util.prefix.text}command [enable|disable] コマンド有効・無効切り替え
${robot.kokoro.util.prefix.text}ifl                      Google I'm Feeling Lucky
${robot.kokoro.util.prefix.text}bis                      Bing画像検索 (3000req/month)
${robot.kokoro.util.prefix.text}gis                      Google画像検索 (100req/day)
${robot.kokoro.util.prefix.text}irasutoya                いやすとや画像検索
${robot.kokoro.util.prefix.text}dice                     さいころ
${robot.kokoro.util.prefix.text}lgtm                     LGTM

${robot.kokoro.util.prefix.text}mstdn                    🐘
${robot.kokoro.util.prefix.text}社会                     つらい
${robot.kokoro.util.prefix.text}ikku                     古池や 蛙飛び込む 水の音
${robot.kokoro.util.prefix.text}timeline                 このチャンネルの発言を他のチャンネルに複製します (slack向け)

${robot.kokoro.util.prefix.text}bash                     docker run -i --rm --network none base/archlinux
${robot.kokoro.util.prefix.text}node                     docker run -i --rm --network none node:alpine
${robot.kokoro.util.prefix.text}php                      docker run -i --rm --network none php:alpine
${robot.kokoro.util.prefix.text}python                   docker run -i --rm --network none python:alpine
${robot.kokoro.util.prefix.text}ruby                     docker run -i --rm --network none ruby:alpine

${robot.kokoro.util.prefix.text}help                     このメッセージ
${robot.kokoro.util.prefix.text}ping                     pong
${robot.kokoro.util.prefix.text}kill                     😇
\`\`\``;

    msg.send(help);
  });
};
