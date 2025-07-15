const {
  Client, GatewayIntentBits, Partials,
  EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events
} = require("discord.js");
const express = require("express");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

const PREFIX = "-";
const app = express();
const PORT = process.env.PORT || 3000;

// === ROLES ===
const DEFAULT_ROLE = "1394733004680593409";
const VERIFIED_ROLE = "1393008654999093380";
const GUILD_ID = "1393008576804687942";

// === When user joins, give them unverified role ===
client.on(Events.GuildMemberAdd, member => {
  member.roles.add(DEFAULT_ROLE).catch(console.error);
});

// === Prefix Command: -verifypanel ===
client.on("messageCreate", async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "verifypanel") {
    const embed = new EmbedBuilder()
      .setTitle("🔒 Verify Your Identity")
      .setDescription("Click the button below to verify yourself.")
      .setColor("Blue");

    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Verify Me")
      .setURL(`https://your-cloudflare-name.pages.dev/verify?user=${message.author.id}`);

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// === EXPRESS CALLBACK SERVER ===
app.get("/callback", async (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.status(400).send("No user ID!");

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(userId);

    await member.roles.remove(DEFAULT_ROLE);
    await member.roles.add(VERIFIED_ROLE);

    return res.redirect("https://your-cloudflare-name.pages.dev/success");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Verification failed.");
  }
});

app.listen(PORT, () => console.log(`Express callback listening on port ${PORT}`));

client.login(process.env.TOKEN);
