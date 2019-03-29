const kokoro = require('kokoro-io');

const reizeAPIUrl = `${process.env.BASE_URL}/api/v1/image/resize`;
const accessToken = process.env.HUBOT_KOKOROIO_ACCESSTOKEN || '';
const client = new kokoro.io({
  accessToken,
});

function resizeImage(url, param) {
  return `${reizeAPIUrl}?url=${encodeURIComponent(url)}&${param}`;
}

function addHR(text) {
  const HRed = `${text}

----

`;
  return HRed;
}

function kokoronize(body) {
  let text = '';
  if (!(body.text || body.attachments)) {
    return body;
  }

  if (body.text) {
    text += body.text;
  }

  if (body.attachments) {
    if (text !== '') {
      text = addHR(text);
    }

    body.attachments.forEach((attachment) => {
      if (attachment.pretext) {
        text += `
${attachment.pretext}
`;
      }

      if (attachment.title && attachment.title_link) {
        text += `> ## [${attachment.title}](${attachment.title_link})`;
      } else if (attachment.title) {
        text += `> ## ${attachment.title}`;
      } else if (attachment.title_link) {
        text += `> ## ${attachment.title_link}`;
      }

      let author = '';
      let icon = '';
      if (attachment.author_icon) {
        icon += `![attachment.author_icon](${resizeImage(attachment.author_icon, 'height=16')}) `;
      }
      if (attachment.author_name && attachment.author_link) {
        author += `##### ${icon}[${attachment.author_name}](${attachment.author_link})`;
      } else if (attachment.author_name) {
        author += `##### ${icon}${attachment.author_name}`;
      } else if (attachment.author_link) {
        author += `##### ${icon}${attachment.author_link}`;
      }
      text += `> ${author}`;

      if (attachment.text) {
        text += `
> ${attachment.text}
`;
      }

      if (attachment.image_url) {
        text += `
> ![attachment.image_url](${attachment.image_url})
`;
      }

      if (attachment.fields) {
        attachment.fields.forEach((field) => {
          text += `
> #### **${field.title}**
> ${field.value}
`;
        });
      }

      if (attachment.actions && attachment.fallback) {
        text += `> \`${attachment.fallback}\``;
      }

      if (attachment.footer_icon) {
        attachment.footer_icon = resizeImage(attachment.footer_icon, 'height=16');
      }
      if (attachment.footer && attachment.footer_icon) {
        text += `
> ##### ![attachment.footer_icon](${attachment.footer_icon}) ${attachment.footer}`;
      } else if (attachment.footer) {
        text += `
> ##### ${attachment.footer}`;
      } else if (attachment.footer_icon) {
        text += `
> ##### ![attachment.footer_icon](${attachment.footer_icon})`;
      }

      if (attachment.ts) {
        const date = new Date((attachment.ts - 0) * 1000);
        text += ` | ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      }

      text += '\n';
    });
  }
  return text;
}

module.exports = (robot) => {
  robot.router.post('/slack/incoming/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const message = kokoronize(req.body);
    const result = await client.Api.Bot.postChannelMessage(roomId, {
      message,
    });
    return res.send(result && result.id ? 200 : 500);
  });
};
