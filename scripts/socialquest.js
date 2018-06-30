const random = require('../helpers/random');

const maxHp = 100;
const heal = 10;
const maxDamage = 17;

module.exports = ((robot) => {
  robot.hear(/^\/社会 (.*)$/mi, (msg) => {
    const mode = msg.match[1];
    const current = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`);
    switch (mode) {
      case 'register':
        let hp = 100;
        let dbHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_hp`);
        if (dbHp) {
          hp = dbHp;
        }

        if (current === 1) {
          msg.reply(`既に社会に参加しています。 残りHP: ${hp}/${maxHp}`);
          return;
        }

        if (hp < 1) {
          hp = maxHp;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`, 1);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_hp`, hp);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_last`, new Date().getTime());
        robot.brain.save();
        if (hp === maxHp) {
          msg.reply(`は社会に参加しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
        } else {
          msg.reply(`は社会に復帰しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
        }
        break;
      case 'unregister':
        if (current === 0) {
          msg.reply(`既に社会から離脱しています。`);
          return;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`, 0);
        robot.brain.save();
        msg.reply(`は社会から離脱しました。来世もがんばりましょう。`);
        break;
      case 'status':
        if (robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`) !== 1) {
          msg.reply(`社会に参加していません。`);
        } else {
          const hp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_hp`);
          msg.reply(`社会に参加しています。 残りHP: ${hp}/${maxHp}`);
        }
        break;
      default:
        msg.reply(`/社会 [register|unregister|status]`);
        break;
    }
  });

  robot.hear(/疲|つかれた|つかれて|ひろう|だるい|だるく|つらい|つらく|しんどい|しんどく/, (msg) => {
    if (msg.message.text.indexOf('ない') === -1 && robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`) === 1) {
      const currentHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_hp`) || maxHp;
      if (currentHp < 1) {
        return;
      }

      const lastDamage = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_last`);

      let nextHp = currentHp;
      if (lastDamage && new Date(lastDamage).getDate() !== new Date().getDate()) {
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_last`, new Date().getTime());
        nextHp += heal * Math.abs(Math.sail((new Date(lastDamage).getDate() - new Date().getDate()) / 86400000));
      }
      if (nextHp > maxHp) {
        nextHp = maxHp;
      }

      const damage = random(1, maxDamage);
      if (damage % 7 === 0) {
        msg.reply(`社会のこうげき！ ${msg.message.user}はひらりと身をかわした！ 残りHP: ${nextHp}/${maxHp}`);
      } else {
        nextHp -= damage;
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_hp`, nextHp);
        msg.reply(`社会のこうげき！ ${msg.message.user}に${damage}のダメージ！ 残りHP: ${nextHp}/${maxHp}`);
      }

      if (nextHp < 1) {
        msg.reply(`あなたは社会の荒波に打ち勝てませんでした。来世もがんばりましょう。（registerで最初からはじめる）`);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.message.user}_enable`, 0)
      }

      robot.brain.save();
    }
  });
});
