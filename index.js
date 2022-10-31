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
  },
  {
    name: 'help',
    description: 'Send help'
  },
  {
    name: 'ban',
    description: 'ban member',
    options: [
      {
        type: "STRING",
        name: "id",
        description: "Member id",
        required: true
      }
    ]
  }
]
client.on('ready', () => {
  client.application.commands.set(cmds)
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
  } else if (cmd == "help") {
    await interaction.followUp({
      embeds: [e({
        title: "Help menu",
        description: `${cmds.map(c=>`\`${c.name}\`: ${c.description}`).join("\n")}`,
        color: 0x6395FF
      })]
    })
  } else if (cmd == "ban") {
    if(!interaction.member.permissions.has("BanMembers")) return await interaction.followUp("You not have \"BanMembers\" permission.")
    interaction.guild.ban(interaction.options.get("id")).then(()=>{
      interaction.followUp("banned")
    }).catch(()=>{
      interaction.followUp("failed to ban")
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
