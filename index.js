const { EmbedBuilder, Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.on("messageCreate", message=>{
  if(message.author.bot) return
  message.channel.send(message.content)
})

require("dotenv").config()
client.login(process.env.token)
