require("dotenv").config()//a
const yts = require('youtube-search')
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits } = require('discord.js')
const { AudioPlayer, joinVoiceChannel, createAudioResource } = require('@discordjs/voice')
const { Player, QueryType } = require("discord-player")
const { generate } = require("cjp")
const axios = require("axios")
const sharp = require("sharp")
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
client.player.on("connectionError",()=>{})
client.player.on("error",()=>{})
const cmds = [
  {
    type: 1,
    name: 'ping',
    description: 'Send ping',
  },
  {
    type: 1,
    name: 'help',
    description: 'Send help'
  },
  {
    type: 1,
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
    type: 1,
    description: "Music commands",
    options: [
      {
        type: 1,
        name: "play",
        description: "Play music",
        options: [{
          type: 3,
          name: "query",
          description: "Youtube search query",
          required: true
        }]
      },
      {
        type: 1,
        name: "stop",
        description: "Stop music and leave voice channel"
      },
      {
        type: 1,
        name: "queue",
        description: "Show queue"
      },
      {
        type: 1,
        name: "skip",
        description: "Skip track"
      }
    ]
  },
  {
    type: 1,
    name: "test",
    description: "test command"
  },
  {
    type: 1,
    name: "image",
    description: "Image commands",
    options: [{
      type: 1,
      name: "deceased",
      description: "Portrait of the deceased user",
      options: [{
        type: 6,
        name: "user",
        description: "Deceased user",
        required: false
      }]
    }]
  },
  {
    type: 1,
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
    type: 1,
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
let spm = {}
client.on('messageCreate', message => {
  if(message.author.bot) return
  if(spm[String(message.author.id)]) {
    if(Date.now() - spm[String(message.author.id)].last <= 1200) {
      spm[String(message.author.id)].mps++
    } else {
      spm[String(message.author.id)].mps = 1
      spm[String(message.author.id)].last = Date.now()
    }
  } else spm[String(message.author.id)] = {last: Date.now(), mps: 1}
  if (spm[String(message.author.id)].mps>= 3) {
    message.channel.bulkDelete(3, m => m.author.id == message.author.id)
      .then(()=>{
        message.channel.send("🗑 **Deleted spam messages**")
      })
    let spml = client.channels.cache.get("1040551201235804200")
    let spmcnt = spml.topic.split(":")[1].slice(1)
    spml.send({embeds:[e({
      title: message.author.tag + " | " + message.author.id,
      description: `#${spmcnt} Deleted 3 spam messages`
    })]})
    spml.setTopic(`Detected spam: ${++spmcnt}`)
  }
})
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    let cmd = interaction.options.getSubcommand(false) ? [interaction.commandName, interaction.options.getSubcommand(false)].join("/") : interaction.commandName
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
      interaction.followUp(generate(interaction.options.get("jp").value))
    } else if (cmd == "image/deceased") {
      let avatar = await shimg((interaction.options.getUser("user") || interaction.user).displayAvatarURL() || "https://discord.com/assets/c09a43a372ba81e3018c3151d4ed4773.png")
      let grs = await sharp(avatar)
        .webp({quality: 100, lossless: true})
        .grayscale()
        .resize({width:481,height:589,fit:"inside"})
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .webp({quality: 100, lossless: true})
        .toBuffer()
      let iei = await sharp("transback.png")
        .composite([{
          input: "untrans.png"
        },{
          input: grs,
        },{
          input: "38F73508-369C-462C-89AD-349807C7DB14.png"
        }])
        .webp({quality: 100, lossless: true})
        .toBuffer()
      interaction.followUp({files:[{attachment:iei,name:"deceased.webp",description:""}]})
    } else if (cmd == "music/play") {
      if(!interaction.member.voice.channel) return interaction.followUp("⚠️Error\nYou must join voice channel")
      let channel = interaction.member.voice.channel
      const queue = client.player.createQueue(interaction.guild, {
        ytdlOptions: {
          filter: 'audioonly',
          highWaterMark: 1 << 30,
          dlChunkSize: 0,
        },
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
      if(track.tracks.length < 1) return interaction.followUp("Couldn't find video")
      let ttr = track.tracks[0]
      queue.addTrack(ttr)
      if (!queue.playing) {
        queue.play()
          .then(()=>{
            interaction.followUp({embeds:[e({
              title: res.title,
              image: res.thumbnails.high.url,
              color: 0xFF0000,
              author: {
                name: res.channelTitle
              }
            })]})
          })
      } else {
        interaction.followUp({content:"✅ **Track added to queue successfuly**",embeds:[e({
          title: ttr.title,
          image: ttr.thumbnail,
          color: 0xFF0000,
          author: {
           name: ttr.author
          }
        })]})
      }
    } else if (cmd == "music/stop") {
      client.player.deleteQueue(interaction.guild.id)
      interaction.followUp("✅ **Success to leave the voice channel**")
    } else if (cmd == "music/queue") {
      interaction.followUp({embeds:[e({
        color: 0xFF0000,
        title: "Queue",
        description: `${client.player.getQueue(interaction.guild) ? client.player.getQueue(interaction.guild).tracks.map((t, i)=>`${i+1} - **${t.title}**`).join("\n") : "**No queue**"}`
      })]})
    } else if (cmd == "music/skip") {
      if(client.player.getQueue(interaction.guild)) {
        if (client.player.getQueue(interaction.guild).skip()) {
          interaction.followUp("✅ **Success to skip**")
        } else {
          interaction.followUp(":x: **Failed to skip**")
        }
      } else {
        interaction.followUp(":x: **Failed to skip**(no queue)")
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
  obj.image ? ret.setImage(obj.image) : void(0)
  obj.author ? ret.setAuthor(obj.author) : void(0)
  obj.url ? ret.setURL(obj.url) : void(0)
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
function shimg (l) {
  return new Promise((res, rej)=>{
    axios.get(l, {
      responseType: "arraybuffer",
    }).then(r=>res(Buffer.from(r.data, "base64")))
  })
}
client.login(process.env.token)
