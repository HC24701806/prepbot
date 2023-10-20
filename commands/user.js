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

const { getFirestore, doc, getDoc } = require("firebase/firestore")
const db = getFirestore(app)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Returns user profile. Parameters: default for own profile, add tag for another user\'s profile')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('User to be displayed')),
	async execute(interaction) {
    let target = interaction.options.getUser('target') ?? interaction.user
    let targetID = target.id

    let targetDoc = getDoc(doc(db, 'users', targetID))
    if(!(await targetDoc).exists()) {
      await interaction.reply('User is not registered; to register, use /register')
      return;
    }

    const targetData = (await targetDoc).data()
    const points = (await getDoc(doc(db, 'points', targetID))).data()
    const tournament = (await getDoc(doc(db, 'tournament', targetID))).data()

    let ranks = [points.rank, points.highestRank, tournament.rank, tournament.highestRank]
    for(let i = 0; i < 4; ++i) {
      if(ranks[i] == 0) {
        ranks[i] = 'N/A'
      } else {
        ranks[i] = ranks[i].toString()
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x14C7B2)
      .setTitle(targetData.username)
      .setThumbnail(target.avatarURL())
      .setDescription('Joined: ' + targetData.joined.toDate().toString().substring(4, 15))
      .addFields(
        {name: '\u200b', value: '\u200b'},
        {name: 'Problems', value: '\u200b'},
        {name: 'Total Points', value: points.points.toString(), inline: true},
        {name: 'Problems Tried', value: points.problemsAttempted.toString(), inline: true},
        {name: 'Problems Solved', value: points.problemsSolved.toString(), inline: true},
        {name: 'Accuracy', value: (Math.round(points.problemsSolved/points.problemsAttempted * 1000)/10.0).toString() + '%', inline: true},
        {name: 'Current Rank', value: ranks[0], inline: true},
        {name: 'Highest Rank', value: ranks[1], inline: true}/*,
        {name: '\u200b', value: '\u200b'},
        {name: 'Tournament', value: '\u200b'},
        {name: 'Current Rating', value: tournament.rating.toString(), inline: true},
        {name: 'Highest Rating', value: tournament.highestRating.toString(), inline: true},
        {name: 'Games', value: tournament.numGames.toString(), inline: true},
        {name: 'Wins', value: tournament.numWins.toString(), inline: true},
        {name: 'Current Rank', value: ranks[2], inline: true},
        {name: 'Highest Rank', value: ranks[3], inline: true}*/
      )

    await interaction.reply({embeds: [embed]})
	},
};