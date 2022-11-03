require("dotenv").config()
const yts = require('youtube-search')
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits } = require('discord.js')
const { AudioPlayer, joinVoiceChannel, createAudioResource } = require('@discordjs/voice')
const { Player, QueryType } = require("discord-player");
const { generate } = require("cjp")
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
});
client.player = new Player(client)
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
    name: 'music',
    description: 'Play music',
    options: [
      {
        type: 3,
        name: "query",
        description: "Youtube search query",
        required: true
      }
    ]
  },
  {
    name: 'cjp',
    description: '怪レい日本语',
    options: [
      {
        type: 3,
        name: "jp",
        description: "text (Japanese)",
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
      "ja": "メッセージを通報",
      "en-US": "Report message",
      "en-GB": "Report message",
      "bg": "доклад",
      "ru": "отчет",
      "zh-CN": "报告",
      "zh-TW": "报告"
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
      interaction.guild.bans.create(interaction.options.get("id").value).then(()=>{
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
    } else if (cmd == "cjp") {
      const cjpt = generate(interaction.options.get("jp").value)
      console.log(cjpt)
      interaction.followUp(cjpt)
    } else if (cmd == "music") {
      if(!interaction.member.voice.channel) {return interaction.followUp("⚠️Error\nYou must join voice channel")}
      let channel = interaction.member.voice.channel
      const queue = client.player.createQueue(interaction.guild, {
        metadata: {
          channel: interaction.channel,
        }
      });
      if (!queue.connection) await queue.connect(interaction.member.voice.channel)
      const res = await search(interaction.options.get("query").value)
      const track = await client.player
        .search(res.link, {
          requestedBy: interaction.user,
          searchEngine: QueryType.YOUTUBE_VIDEO,
        })
      console.log(track)
      if(track.tracks.length < 1) return interaction.followUp("Couldn't find video")
      await queue.addTrack(track.tracks[0])
      if (!queue.playing) {
        queue.play()
          .then(()=>{
            interaction.followUp({embeds:[e({
              title: res.title,
              image: res.thumbnails.default,
              author: {
                name: res.channelTitle
              }
            })]})
          })
      }
    }
  } else if (interaction.isMessageContextMenuCommand()) {
    if (interaction.commandName == "report") {
      await interaction.deferReply({
        ephemeral: true
      })
      let message = interaction.targetMessage
      client.channels.cache.get("1036928987370373170").send({
        content: `Message link: ${message.url}`,
        components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`reportdel-${message.channel.id}-${message.id}`)
                .setLabel('Delete')
                .setStyle(ButtonStyle.Primary)
        )],
        embeds: [e({
          title: `${message.author.tag} | ${message.author.id}`,
          description: `${message.content}`,
          footer: {
            text: `Report by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
          },
          thumbnail: message.author.displayAvatarURL()
        })]
      }).then(()=>{
        interaction.followUp({
          content: "Report success",
          ephemeral: true
        })
      }).catch(()=>{
        interaction.followUp({
          content: "Report failed",
          ephemeral: true
        })
      })
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith("reportdel-")) {
      const [, cid, mid] = interaction.customId.split("-")
      client.channels.cache.get(cid).messages.cache.get(mid).delete()
    }
  }
})
function e(obj){
  let ret = new EmbedBuilder()
  ret
    .setTitle(obj.title)
  obj.color ? ret.setColor(obj.color) : void(0)
  obj.description ? ret.setDescription(obj.description) : void(0)
  obj.fields ? ret.addFields(obj.fields) : void(0)
  obj.footer ? ret.setFooter(obj.footer) : void(0)
  obj.thumbnail ? ret.setThumbnail(obj.thumbnail) : void(0)
  return ret
}
function search(q) {
  return new Promise((resolve, reject)=>{
    yts(q, {maxResults:1,key:process.env.ytapi,type:"video"}, (err, results) => {
      if(err) reject(err);
      resolve(results[0])
    })
  })  
}
client.login(process.env.token)
