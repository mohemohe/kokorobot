const fns = require('date-fns');
const random = require('../helpers/random');

const maxHp = 100;
const heal = 10;
const maxDamage = 17;

module.exports = ((robot) => {
  robot.hear(/^\/社会 (.*)$/mi, (msg) => {
    const mode = msg.match[1];
    const current = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`);
    const dbHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_hp`);
    let hp = 100;
    switch (mode) {
      case 'register':
        if (dbHp) {
          hp = dbHp;
        }

        if (current === 1) {
          msg.reply(`${msg.message.user}は既に社会に参加しています。 残りHP: ${hp}/${maxHp}`);
          return;
        }

        if (hp < 1) {
          hp = maxHp;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`, 1);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_hp`, hp);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_last`, new Date().getTime());
        robot.brain.save();
        if (hp === maxHp) {
          msg.reply(`${msg.message.user}は社会に参加しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
        } else {
          msg.reply(`${msg.message.user}は社会に復帰しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
        }
        break;
      case 'unregister':
        if (current === 0) {
          msg.reply(`${msg.message.user}は既に社会から離脱しています。`);
          return;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`, 0);
        robot.brain.save();
        msg.reply(`${msg.message.user}は社会から離脱しました。来世もがんばりましょう。`);
        break;
      case 'status':
        if (robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`) !== 1) {
          msg.reply(`${msg.message.user}は社会に参加していません。`);
        } else {
          msg.reply(`${msg.message.user}は社会に参加しています。 残りHP: ${dbHp}/${maxHp}`);
        }
        break;
      default:
        msg.reply('/社会 [register|unregister|status]');
        break;
    }
  });

  robot.hear(/疲|苦|眠|怠|つかれ[たてす]?|ひろう|だる[いくす]?|つら[いくす]?|ねむ[いくす]?|しんど[いくす]?|くるし[いくす]?|tukare|ｔｕｋａｒｅ|tsukare|ｔｓｕｋａｒｅ|tire|ｔｉｒｅ|ちれ|たいや|タイヤ/, (msg) => {
    if (msg.message.text.indexOf('ない') !== -1 && robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`) !== 1) {
      return;
    }

    const msgArray = [];
    const currentHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_hp`) || maxHp;
    if (currentHp < 1) {
      return;
    }

    const lastDamage = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_last`);

    let nextHp = currentHp;
    if (lastDamage) {
      const days = Math.abs(fns.differenceInDays(fns.startOfDay(new Date(lastDamage)), fns.startOfDay(new Date())));
      if (days > 0) {
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_last`, new Date().getTime());
        nextHp += heal * days;
        if (nextHp > maxHp) {
          nextHp = maxHp;
        }
        msgArray.push(`最後に攻撃を受けてから ${days} 日経過しました。HP回復処理を行います。 ${currentHp} → ${nextHp}/${maxHp}`);
      }
    }

    const damage = Math.floor((random(1, maxDamage) + random(1, maxDamage) + random(1, maxDamage)) / 3);
    if (damage % 7 === 0) {
      msgArray.push(`社会のこうげき！ ${msg.message.user}はひらりと身をかわした！ 残りHP: ${nextHp}/${maxHp}`);
    } else {
      nextHp -= damage;
      msgArray.push(`社会のこうげき！ ${msg.message.user}に${damage}のダメージ！ 残りHP: ${nextHp}/${maxHp}`);
    }
    robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_hp`, nextHp);

    if (nextHp < 1) {
      msgArray.push(`${msg.message.user}は社会の荒波に打ち勝てませんでした。来世もがんばりましょう。（registerで最初からはじめる）`);
      robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.screen_name}_enable`, 0);
    }

    robot.brain.save();
    msg.reply(...msgArray);
  });
});
