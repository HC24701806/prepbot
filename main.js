const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions} = require("discord.js");

const prefix = '!';

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

client.login(process.env.token);

client.on("ready", () => {
    client.user.setActivity("!ping", {type: "PLAYING"});
});

client.on("messageCreate", (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command == 'ping') {
        message.channel.send("ping");
    }
})