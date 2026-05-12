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

  try {

    console.log('📩 DM recebida:', message.content);

    const confession = message.content.trim();

    if (!confession) return;

    const channel = await client.channels.fetch(
      CONFESSION_CHANNEL_ID
    );

    if (!channel) {
      console.log('❌ Canal não encontrado');
      return;
    }

    const msg = await channel.send(
`💌 **Confissão Anônima:**

${confession}`
    );

    await msg.react('❤️');
    await msg.react('💔');

    console.log('✅ Confissão enviada');

    try {
      await message.author.send(
        '✅ Sua confissão foi enviada anonimamente.'
      );
    } catch {
      console.log('⚠️ Não consegui responder a DM');
    }

  } catch (err) {

    console.log('❌ ERRO NA CONFISSÃO:');
    console.log(err);
  }
}

  });

// =========================
// MAIS ATIVO DO DIA
// =========================

setInterval(async () => {

  const now = new Date();

  if (now.getHours() === 22 && now.getMinutes() === 0) {

    const guild = client.guilds.cache.get("1360398013666689166");

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

Continue assim para manter o cargo amanhã 👑`
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

    const role = guild.roles.cache.get(ROLE_ID);

console.log('ROLE_ID:', ROLE_ID);
console.log('ROLE ENCONTRADO:', role);

    try {
  await member.roles.add(ROLE_ID);
  console.log('✅ Cargo adicionado');
} catch (err) {
  console.log('❌ ERRO AO ADICIONAR CARGO:');
  console.log(err);
    }

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

process.on('unhandledRejection', (reason) => {
  console.log('❌ ERRO NÃO TRATADO:');
  console.log(reason);
});

client.login(process.env.TOKEN);
