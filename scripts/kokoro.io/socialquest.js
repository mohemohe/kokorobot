const fns = require('date-fns');
const random = require('../../helpers/random');
const Prefix = require('../../helpers/prefix');
const user = require('../../helpers/user');

const maxHp = 100;
const dailyHeal = 10;
const maxDamage = 17;
const maxHeal = 8;

module.exports = ((robot) => {
  robot.hear(Prefix.regex('/社会\\s*(.*?)$/mi'), (msg) => {
    console.log(msg.match);

    const mode = msg.match[1];
    const current = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`);
    const dbHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`);
    let rebirth = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`) || 0;
    const auto = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth_auto`) || 0;
    let hp = 100;
    switch (mode) {
      case 'register':
        if (dbHp) {
          hp = dbHp;
        }

        if (current === 1) {
          msg.reply(`${user(robot, msg).displayName}は既に社会に参加しています。 残りHP: ${hp}/${maxHp}`);
          return;
        }

        if (hp < 1) {
          rebirth++;
          robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`, rebirth);
          hp = maxHp;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 1);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`, hp);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`, new Date().getTime());
        robot.brain.save();
        if (hp === maxHp) {
          if (rebirth > 0) {
            msg.reply(`${user(robot, msg).displayName}は社会に参加しました。つよく生きましょう。 残りHP: ${hp}/${maxHp} 転生回数: ${rebirth}`);
          } else {
            msg.reply(`${user(robot, msg).displayName}は社会に参加しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
          }
        } else {
          msg.reply(`${user(robot, msg).displayName}は社会に復帰しました。つよく生きましょう。 残りHP: ${hp}/${maxHp}`);
        }
        break;
      case 'unregister':
        if (current === 0) {
          msg.reply(`${user(robot, msg).displayName}は既に社会から離脱しています。`);
          return;
        }
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 0);
        robot.brain.save();
        msg.reply(`${user(robot, msg).displayName}は社会から離脱しました。来世もがんばりましょう。`);
        break;
      case 'status':
        if (robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`) !== 1) {
          msg.reply(`${user(robot, msg).displayName}は社会に参加していません。`);
        } else if (rebirth > 0) {
          msg.reply(`${user(robot, msg).displayName}は社会に参加しています。 残りHP: ${dbHp}/${maxHp} 転生回数: ${rebirth}`);
        } else {
          msg.reply(`${user(robot, msg).displayName}は社会に参加しています。 残りHP: ${dbHp}/${maxHp}`);
        }
        break;
      default:
        switch (mode.split(' ')[0]) {
          case 'reincarnation':
            switch (mode.split(' ')[1]) {
              case 'auto':
                if (auto === 1) {
                  msg.reply('自動転生は既に有効です。');
                  break;
                }

                robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth_auto`, 1);
                robot.brain.save();
                msg.reply('自動転生を有効にしました。油断せずに生きましょう。');
                break;
              case 'manual':
                if (auto !== 1) {
                  msg.reply('自動転生は既に無効です。');
                  break;
                }

                robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth_auto`, 0);
                robot.brain.save();
                msg.reply('自動転生を無効にしました。命を大事にしましょう。');
                break;
              case 'status':
                if (auto !== 1) {
                  msg.reply('自動転生は無効です。');
                } else {
                  msg.reply('自動転生は有効です。');
                }
                break;
              default:
                msg.reply(`${Prefix.text}社会 reincarnation [auto|manual|status]`);
                break;
            }
            break;
          default:
            msg.reply(`${Prefix.text}社会 [register|unregister|status|reincarnation]`);
            break;
        }
    }
  });

  robot.hear(/疲|苦|眠|怠|突|痛|つかれ[たてす]?|ひろう|だる[いくす]?|つら[いくす]?|ねむ[いくす]?|しんど[いくす]?|くるし[いくす]?|いた[いくす]|tukare|ｔｕｋａｒｅ|tsukare|ｔｓｕｋａｒｅ|tire|ｔｉｒｅ|tiring|ｔｉｒｉｎｇ|ちれ|たいや|タイヤ|たれかつ|タレかつ|タレカツ|たれカツ/gi, (msg) => {
    if (msg.message.text.indexOf('ない') !== -1 || robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`) !== 1) {
      return;
    }

    const attacks = msg.match.length;
    let attackName;
    switch (attacks) {
      case 1:
        attackName = 'こうげき！';
        break;
      case 2:
        attackName = 'はやぶさ斬り！';
        break;
      default:
        attackName = 'れんぞくこうげき！';
        break;
    }

    const msgArray = [];
    const currentHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`) || maxHp;
    if (currentHp < 1) {
      return;
    }

    const lastDamage = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`);

    let nextHp = currentHp;
    if (lastDamage) {
      const days = Math.abs(fns.differenceInDays(fns.startOfDay(new Date(lastDamage)), fns.startOfDay(new Date())));
      if (days > 0) {
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`, new Date().getTime());
        nextHp += dailyHeal * days;
        if (nextHp > maxHp) {
          nextHp = maxHp;
        }
        msgArray.push(`宿屋で休んでから ${days} 日経過しました。 ${currentHp} → ${nextHp}/${maxHp}`);
      }
    }

    const damage = (new Array(attacks)).fill(0).map(() => Math.floor((random(1, maxDamage) + random(1, maxDamage) + random(1, maxDamage)) / 3)).reduce((a, b) => a + b);
    if (damage % 7 === 0) {
      msgArray.push(`社会の${attackName} ${user(robot, msg).displayName}はひらりと身をかわした！ 残りHP: ${nextHp}/${maxHp}`);
    } else {
      nextHp -= damage;
      msgArray.push(`社会の${attackName} ${user(robot, msg).displayName}に${damage}のダメージ！ 残りHP: ${nextHp}/${maxHp}`);
    }
    robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`, nextHp);

    if (nextHp < 1) {
      const auto = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth_auto`) || 0;
      if (auto === 1) {
        let rebirth = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`) || 0;
        rebirth++;
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`, rebirth);
        nextHp = maxHp;
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 1);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`, nextHp);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`, new Date().getTime());
        msgArray.push(`${user(robot, msg).displayName}は社会の荒波に打ち勝てませんでした。`);
        msgArray.push(`温かい光が${user(robot, msg).displayName}の体を包み込んだ。 残りHP: ${nextHp}/${maxHp} 転生回数: ${rebirth}`);
      } else {
        msgArray.push(`${user(robot, msg).displayName}は社会の荒波に打ち勝てませんでした。来世もがんばりましょう。（registerで最初からはじめる）`);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 0);
      }
    }

    robot.brain.save();
    msg.reply(...msgArray);
  });

  robot.hear(/^@(.*)\s.*(えら|偉|すご)[いくす]?.*$/m, (msg) => {
    if (msg.message.text.indexOf('ない') !== -1 || robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`) !== 1 || robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.match[1]}_enable`) !== 1) {
      return;
    }

    const currentHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${msg.match[1]}_hp`) || maxHp;
    if (currentHp < 1) {
      return;
    }

    let nextHp = currentHp;
    const heal = Math.floor((random(1, maxHeal) + random(1, maxHeal) + random(1, maxHeal)) / 3);
    if (heal % 3 === 0) {
      msg.send(`@${msg.match[1]} ${user(robot, msg).displayName}のかいふくまほう！ @${msg.match[1]} はひらりと身をかわした！ 残りHP: ${nextHp}/${maxHp}`);
    } else {
      nextHp += heal;
      if (nextHp > maxHp) {
        nextHp = maxHp;
      }
      msg.send(`@${msg.match[1]} ${user(robot, msg).displayName}のかいふくまほう！ @${msg.match[1]} は${heal}回復した！ 残りHP: ${nextHp}/${maxHp}`);
    }
    robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${msg.match[1]}_hp`, nextHp);

    robot.brain.save();
  });

  robot.hear(/[死し]ん[だでじ]/, (msg) => {
    if (msg.message.text.indexOf('ない') !== -1 || robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`) !== 1) {
      return;
    }

    const msgArray = [];
    const currentHp = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`) || maxHp;
    if (currentHp < 1) {
      return;
    }

    const lastDamage = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`);

    let nextHp = currentHp;
    if (lastDamage) {
      const days = Math.abs(fns.differenceInDays(fns.startOfDay(new Date(lastDamage)), fns.startOfDay(new Date())));
      if (days > 0) {
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`, new Date().getTime());
        nextHp += dailyHeal * days;
        if (nextHp > maxHp) {
          nextHp = maxHp;
        }
        msgArray.push(`宿屋で休んでから ${days} 日経過しました。 ${currentHp} → ${nextHp}/${maxHp}`);
      }
    }

    const damage = 65535;
    nextHp -= damage;
    msgArray.push(`社会のこうげき！ ${user(robot, msg).displayName}に${damage}のダメージ！ 残りHP: ${nextHp}/${maxHp}`);
    robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`, nextHp);

    if (nextHp < 1) {
      const auto = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth_auto`) || 0;
      if (auto === 1) {
        let rebirth = robot.brain.get(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`) || 0;
        rebirth++;
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_rebirth`, rebirth);
        nextHp = maxHp;
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 1);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_hp`, nextHp);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_last`, new Date().getTime());
        msgArray.push(`${user(robot, msg).displayName}は死んでしまった！`);
        msgArray.push(`温かい光が${user(robot, msg).displayName}の体を包み込んだ。 残りHP: ${nextHp}/${maxHp} 転生回数: ${rebirth}`);
      } else {
        msgArray.push(`${user(robot, msg).displayName}は死んでしまった！（registerで最初からはじめる）`);
        robot.brain.set(`kokoroio_socialquest_${msg.message.room}_${user(robot, msg).internalId}_enable`, 0);
      }
    }

    robot.brain.save();
    msg.reply(...msgArray);
  });
});
