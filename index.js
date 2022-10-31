const { EmbedBuilder, Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
});
const cmds = [
  {
    name: 'ping',
    description: 'Send ping',
    expl: `Send bot ping.`
  },
]
client.on('ready', () => {
  client.application.commands.set(cmds.map(c=>{
    delete c.expl
  }))
})
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  let cmd = interaction.commandName
  await interaction.deferReply()
  if (cmd == "ping") {
    await interaction.followUp({
      embeds: [e({
        title: "🏓 **Pong!**",
        description: `ping: ${client.ws.ping}`,
        color: 0x00FF00
      })]
    })
  }
})
function e(obj){
  let ret = new EmbedBuilder()
  ret
    .setTitle(obj.title)
  obj.color ? ret.setColor(obj.color) : void(0)
  obj.description ? ret.setDescription(obj.description) : void(0)
  obj.fields ? ret.addFields(obj.fields) : void(0)
  return ret
}

require("dotenv").config()
client.login(process.env.token)
