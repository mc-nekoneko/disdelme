import {
  Client,
  Intents,
  GuildChannelManager,
  MessageManager,
  TextChannel,
  Guild,
} from "discord.js";

import { program } from "commander";

program
  .option(`-t, --token <token>`, `Discord bot Token`)
  .option(`-g --guilds <guilds...>`, `Target Guild Id...`)
  .option(`-c --channels <channels...>`, `Target Channel Id...`)
  .option(`-k --keywords <keywords...>`, `Keywords of messages to delete`);

program.parse(process.argv);

const options = program.opts();

const token: string = options.token || undefined;
const targetGuilds: Array<string> = options.guilds || [];
const targetChannels: Array<string> = options.channels || [];
const keywords: Array<string> = options.keywords || [];

if (keywords.length === 0) {
  console.error("No keywords specified");
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log("Bot has ready!");

  targetGuilds.forEach((guildId) => {
    console.log(`Fetching guild '${guildId}'`);
    client.guilds
      .fetch(guildId)
      .then((guild) => {
        console.log(`Found guild '${guild.id}'`);
        findChannels(guild);
      })
      .catch((error) => console.error(error));
  });
});

function findChannels(guild: Guild) {
  const channelManager: GuildChannelManager = guild.channels;
  targetChannels.forEach((channelId) => {
    channelManager
      .fetch(channelId)
      .then((channel) => {
        if (channel instanceof TextChannel) {
          deleteMessages(channel);
        } else if (channel) {
          console.log(`Channel '${channel.id}' is not TextChannel`);
        } else {
          console.log(`Channel '${channelId}' is not found`);
        }
      })
      .catch((error: Error) => console.error(error));
  });
}

function deleteMessages(channel: TextChannel, beforeId?: string) {
  const messageManager: MessageManager = channel.messages;
  const options = { limit: 100, before: beforeId };
  messageManager.fetch(options).then(async (map) => {
    let befId;
    let found = false;

    for (const msg of map.values()) {
      const message: string = msg.content;
      if (!keywords.some((keyword) => message.includes(keyword))) {
        continue;
      }

      const deleted = await msg.delete();
      console.log(`Deleted message from ${deleted.author.username}`);

      befId = deleted.id;
      found = true;
    }

    if (!found) {
      befId = Array.from(map.keys()).pop();
    }

    if (befId !== undefined) {
      deleteMessages(channel, befId);
    }
  });
}

client.login(token);
