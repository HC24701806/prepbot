const { SlashCommandBuilder } = require('discord.js')

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

const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore")
const db = getFirestore(app)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Makes an account. You need an account to use this bot.'),
	async execute(interaction) {
    let userID = interaction.user.id
    const docRef = doc(db, 'users', userID)
    if((await getDoc(docRef)).exists()) {
      await interaction.reply('You are already registered.')
    } else {
      await interaction.reply('You are registered!')
      let userTag = interaction.user.tag
      let date = new Date()
      await setDoc(docRef, {
        joined: date,
        username: userTag
      })

      await setDoc(doc(db, 'points', userID), {
        highestRank: 0,
        points: 0,
        problemsAttempted: 0,
        problemsSolved: 0,
        rank: 0
      })

      await setDoc(doc(db, 'tournament', userID), {
        highestRank: 0,
        highestRating: 1000,
        numGames: 0,
        numWins: 0,
        rank: 0,
        rating: 1000
      })

      await setDoc(doc(db, 'review', userID), {
        problems: {}
      })
    }
	},
};