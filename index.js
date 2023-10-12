//init discord.js
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})
const { token } = require('./config.json')
const fs = require('node:fs')
const path = require('node:path')

const { initializeApp } = require("firebase/app")

const firebaseConfig = {
  apiKey: "AIzaSyAwTd0b1zOUtPuvkcvCjvejApXHrHGBdnQ",
  authDomain: "prepbot-2a03b.firebaseapp.com",
  projectId: "prepbot-2a03b",
  storageBucket: "prepbot-2a03b.appspot.com",
  messagingSenderId: "642487524101",
  appId: "1:642487524101:web:9ab85977ede3d47a0ef56c",
  measurementId: "G-2X4MDBKG4J"
}

const app = initializeApp(firebaseConfig)

const { getFirestore, collection, query, orderBy, getDocs, updateDoc } = require("firebase/firestore")
const db = getFirestore(app)

const { CronJob } = require('cron')
let time = new CronJob('0 * * * *', async () => {
	const ref = collection(db, 'points')
	const q = query(ref, orderBy('points', 'desc'))
	const docs = (await getDocs(q)).docs

	for(let i = 0; i < docs.length; ++i) {
		let entry = docs[i]
		let data = entry.data()
		if(data.points == 0) {
			console.log(entry.id)
			break
		}

		const ref = entry.ref
		let highestRank = data.highestRank
		let currRank = i + 1
		if(data.highestRank == 0 || currRank < data.highestRank) {
			highestRank = currRank
		}

		await updateDoc((ref), {
			highestRank: highestRank,
			rank: currRank
		})
	}
})
time.start()

client.once(Events.ClientReady, c => {
	console.log('Online');
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	}
});

//init command folder
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//read messages
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return
	
	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		await interaction.reply({ content: 'Invalid command', ephemeral: true })
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
	}
})

client.login(token)