const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const { initializeApp } = require("firebase/app")

const firebaseConfig = {
  apiKey: "AIzaSyAwTd0b1zOUtPuvkcvCjvejApXHrHGBdnQ",
  authDomain: "prepbot-2a03b.firebaseapp.com",
  projectId: "prepbot-2a03b",
  storageBucket: "prepbot-2a03b.appspot.com",
  messagingSenderId: "642487524101",
  appId: "1:642487524101:web:9ab85977ede3d47a0ef56c",
  measurementId: "G-2X4MDBKG4J"
};

const app = initializeApp(firebaseConfig)

const { getFirestore, collection, doc, query, where, getDocs, getDoc } = require("firebase/firestore")
const db = getFirestore(app)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('Returns leaderboard. Sort by either points scored (default) or problems solved (prblms). Ranks updated once per minute.')
        .addStringOption(option =>
            option
                .setName('sortby')
                .setDescription('Sort by points (none) or problems solved (prblms)')),
	async execute(interaction) {
        await interaction.deferReply()

        let sortBy = interaction.options.getString('sortby') ?? ''
        sortBy = sortBy.toLowerCase()
        const allowed = ['', 'prblms']
        if(!allowed.includes(sortBy)) {
            await interaction.editReply('That parameter is not currently supported. Currently supported parameters are: None (points) and prblms (problems solved)')
            return
        }

	    const q = query(collection(db, 'points'), where('points', '>', 0))
        const docs = (await getDocs(q)).docs
        let objs = []
        for(let i = 0; i < docs.length; ++i) {
            let entry = docs[i]
            let docData = entry.data()
            docData.username = (await getDoc(doc(db, 'users', entry.id))).data().username
            objs.push(docData)
        }

        const embed = new EmbedBuilder().setColor(0x14C7B2)
        if(sortBy == '') {
            objs.sort((a, b) => (b.points - a.points))

            let str = ''
            for(let i = 1; i <= 10 && i <= objs.length; ++i) {
                let entry = objs[i - 1]
                str += (i + '. ' + entry.username + ' - ' + entry.points + '\n')
            }
            embed.addFields({name: 'Most Points', value: str})
        } else if(sortBy == 'prblms') {
            objs.sort((a, b) => (b.problemsSolved - a.problemsSolved))

            let str = ''
            for(let i = 1; i <= 10 && i <= objs.length; ++i) {
                let entry = objs[i - 1]
                str += (i + '. ' + entry.username + ' - ' + entry.problemsSolved + '\n')
            }
            embed.addFields({name: 'Most Problems Solved', value: str})
        }
        await interaction.editReply({embeds: [embed]})
	},
};