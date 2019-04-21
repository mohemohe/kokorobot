const Prefix = require('../helpers/prefix');
const allowCommand = require('../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(Prefix.regex('/help$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    const help = `\`\`\`
${Prefix.text}command [enable|disable] コマンド有効・無効切り替え
${Prefix.text}bis                      Bing画像検索 (3000req/month)
${Prefix.text}gis                      Google画像検索 (100req/day)
${Prefix.text}irasutoya                いやすとや画像検索
${Prefix.text}dice                     さいころ
${Prefix.text}lgtm                     LGTM

${Prefix.text}mstdn                    🐘
${Prefix.text}社会                     つらい
${Prefix.text}ikku                     古池や 蛙飛び込む 水の音

${Prefix.text}bash                     docker run -i --rm --network none base/archlinux
${Prefix.text}node                     docker run -i --rm --network none node:alpine
${Prefix.text}php                      docker run -i --rm --network none php:alpine
${Prefix.text}python                   docker run -i --rm --network none python:alpine
${Prefix.text}ruby                     docker run -i --rm --network none ruby:alpine

${Prefix.text}help                     このメッセージ
${Prefix.text}ping                     pong
${Prefix.text}kill                     😇
\`\`\``;

    msg.send(help);
  });
};
