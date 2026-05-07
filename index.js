const express = require('express');
const app = express();

const {
  Client,
  GatewayIntentBits,
  Partials
} = require('discord.js');

// =========================
// CONFIG
// =========================

const CHANNEL_ID = "1370461259232837784";
const CONFESSION_CHANNEL_ID = "1497866472439943308";
const ROLE_ID = "1497852631018901626";

// =========================
// EXPRESS
// =========================

app.get('/', (req, res) => {
  res.send('Kyra está viva!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor web ativo na porta ${PORT}`);
});

// =========================
// BOT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],

  partials: [Partials.Channel]
});

// =========================
// VARIÁVEIS
// =========================

let messageCount = {};
let lastWinner = null;

// =========================
// BOT ONLINE
// =========================

client.on('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// =========================
// MENSAGENS
// =========================

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ====================================
  // CONTADOR DE MENSAGENS
  // ====================================

  if (message.guild) {

    const userId = message.author.id;

    if (!messageCount[userId]) {
      messageCount[userId] = 0;
    }

    messageCount[userId]++;

    console.log(
      `${message.author.tag}: ${messageCount[userId]} mensagens`
    );
  }

  // ====================================
  // COMANDO TESTE
  // ====================================

  if (message.content === '!teste') {
    await message.reply('FUNCIONEI 🔥');
  }

  // ====================================
  // CONFISSÃO POR DM
  // ====================================

  if (!message.guild) {

    console.log('DM recebida:', message.content);

    const confession = message.content.trim();

    if (!confession) return;

    const channel = await client.channels.fetch(
      CONFESSION_CHANNEL_ID
    );

    if (!channel) {
      console.log('❌ Canal de confissão não encontrado');
      return;
    }

    const msg = await channel.send(
`💌 **Confissão Anônima:**

${confession}`
    );

    await msg.react('❤️');
    await msg.react('💔');

    await message.author.send(
      '✅ Sua confissão foi enviada anonimamente.'
    );
  }
});

// =========================
// MAIS ATIVO DO DIA
// =========================

// TESTE: executa TODO minuto
// depois troque pra:
// if (now.getHours() === 0 && now.getMinutes() === 0)

setInterval(async () => {

  const now = new Date();

  if (now.getMinutes() % 1 === 0) {

    const guild = client.guilds.cache.first();

    if (!guild) {
      console.log('❌ Nenhum servidor encontrado');
      return;
    }

    let topUser = null;
    let max = 0;

    for (const id in messageCount) {

      if (messageCount[id] > max) {
        max = messageCount[id];
        topUser = id;
      }
    }

    if (!topUser) {
      console.log('❌ Nenhuma mensagem encontrada');
      return;
    }

    const member = await guild.members
      .fetch(topUser)
      .catch(() => null);

    if (!member) {
      console.log('❌ Membro não encontrado');
      return;
    }

    const channel = await client.channels
      .fetch(CHANNEL_ID)
      .catch(() => null);

    if (channel) {

      await channel.send(
`# ✨ Novo Ativo do Dia!

👤 Usuário: ${member}
💬 Mensagens: ${max}

Continue assim para manter o cargo amanhã 👑

<@&1365086815144644698>
<@&1370462756511416320>`
      );
    }

    // remove cargo do antigo

    if (lastWinner) {

      const oldMember = await guild.members
        .fetch(lastWinner)
        .catch(() => null);

      if (oldMember) {
        await oldMember.roles
          .remove(ROLE_ID)
          .catch(() => {});
      }
    }

    // adiciona cargo novo

    await member.roles
      .add(ROLE_ID)
      .catch(() => {});

    lastWinner = topUser;

    console.log(
      `🏆 Novo ativo do dia: ${member.user.tag}`
    );

    // reseta contador

    messageCount = {};
  }

}, 60000);

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
