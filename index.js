const express = require('express');
const app = express();
const CHANNEL_ID = "1370461259232837784";

app.get('/', (req, res) => {
  res.send('Kyra está viva!');
});

app.listen(3000, () => {
  console.log('Servidor web ativo');
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔢 contador de mensagens
let messageCount = {};

// 🏆 cargo
const ROLE_ID = "1497852631018901626";

// 👑 último vencedor
let lastWinner = null;

// 📩 contar mensagens
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!messageCount[userId]) {
    messageCount[userId] = 0;
  }

  messageCount[userId]++;
});

// ⏰ função que roda todo minuto
setInterval(async () => {
  const now = new Date();

  // meia noite exata
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const channel = await client.channels.fetch(CHANNEL_ID);

if (channel) {
  channel.send(`# ✨ **Novo Ativo do Dia!**

👤 Usuário: ${member}
💬 Mensagens: ${max}

Continue assim para manter o cargo amanhã 👑`);
}

    // pega top
    let topUser = null;
    let max = 0;

    for (const userId in messageCount) {
      if (messageCount[userId] > max) {
        max = messageCount[userId];
        topUser = userId;
      }
    }

    if (!topUser) return;

    const member = await guild.members.fetch(topUser);

    // remove do antigo
    if (lastWinner) {
      const oldMember = await guild.members.fetch(lastWinner).catch(() => null);
      if (oldMember) {
        await oldMember.roles.remove(ROLE_ID).catch(() => {});
      }
    }

    // dá pro novo
    await member.roles.add(ROLE_ID);

    lastWinner = topUser;

    console.log(`Novo ativo do dia: ${member.user.tag}`);

    // reset
    messageCount = {};
  }
}, 60000);

client.once('clientReady', () => {
  console.log(`Kyra está online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
