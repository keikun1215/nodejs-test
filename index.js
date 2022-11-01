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
        type: 3,
        name: "id",
        description: "Member id",
        required: true
      }
    ]
  },
  {
    name: 'user',
    description: 'get user infomation',
    options: [
      {
        type: 6,
        name: "user",
        description: "User",
        required: true
      }
    ]
  },
  {
    name: 'report',
    nameLocalizations: {
      "ja": "メッセージを通報"
    },
    type: 3
  }
]
client.on('ready', () => {
  client.application.commands.set(cmds)
})
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
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
      interaction.guild.bans.create(interaction.options.get("id")).then(()=>{
        interaction.followUp("banned")
      }).catch(()=>{
        interaction.followUp("failed to ban")
      })
    } else if (cmd == "user") {
      const u = interaction.options.getUser("user")
      const d = new Date(u.createdTimestamp)
      interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setThumbnail(u.displayAvatarURL() || "https://discord.com/assets/c09a43a372ba81e3018c3151d4ed4773.png")
            .setTitle(u.tag)
            .setDescription(`**Account created**\n${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}\n\n**ID**\n${u.id}`)
        ]
      })
    }
  } else if (interaction.isMessageContextMenuCommand()) {
    await interaction.deferReply()
    let message = interaction.targetMessage
    client.channels.cache.get("1036928987370373170").send({
      content: `Message link: ${message.url}`,
      embeds: [e({
        title: `${message.author.tag} | ${message.author.id}`,
        description: `${message.content}`,
        footer: {
          text: `Report by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        },
        thumbnail: message.author.displayAvatarURL()
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
  obj.footer ? ret.addFooter(obj.footer) : void(0)
  obj.thumbnail ? ret.addThumbnail(obj.thumbnail) : void(0)
  return ret
}

require("dotenv").config()
client.login(process.env.token)
