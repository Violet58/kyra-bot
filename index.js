const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('BOT ONLINE TESTE');
});

client.on('messageCreate', (message) => {
  console.log('MSG:', message.content);
});

client.login(process.env.TOKEN);
