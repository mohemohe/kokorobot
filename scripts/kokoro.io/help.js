const regex = require('../../helpers/regex');
const allowCommand = require('../../helpers/allowcommand');

module.exports = (robot) => {
  robot.hear(regex('/help$/mi'), (msg) => {
    if (!allowCommand(robot, msg)) {
      return;
    }

    let prefix = '/';
    if (process.env.KOKOROBOT_COMMAND_PREFIX && process.env.KOKOROBOT_COMMAND_PREFIX !== '') {
        prefix = process.env.KOKOROBOT_COMMAND_PREFIX;
    }

    const help = `\`\`\`
command [enable|disable] コマンド有効・無効切り替え
bis                      Bing画像検索 (3000req/month) 
gis                      Google画像検索 (100req/day)
irasutoya                いやすとや画像検索
dice                     さいころ
lgtm                     LGTM

mstdn                    🐘
社会                     つらい

bash                     docker run -i --rm --network none base/archlinux
node                     docker run -i --rm --network none node:alpine
php                      docker run -i --rm --network none php:alpine
python                   docker run -i --rm --network none python:alpine
ruby                     docker run -i --rm --network none ruby:alpine

help                     このメッセージ
ping                     pong
kill                     😇
\`\`\``

  msg.send(help.split('\n').map((line) => line !== '' && !line.startsWith('`') ? `${prefix}${line}` : line).join('\n'));
  });
};
