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

const { getFirestore, doc, getDoc, updateDoc } = require("firebase/firestore")
const db = getFirestore(app)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('review')
		.setDescription('Gives a problem that you have gotten wrong before')
        .addStringOption(option =>
            option
                .setName('test')
                .setDescription('Test requested (optional)')),
	async execute(interaction) {
        await interaction.deferReply()

        let userID = interaction.user.id
        const docRef = doc(db, 'users', userID)
        if(!(await getDoc(docRef)).exists()) {
            await interaction.reply('Please register for an account first with /register.')
        } else {
            //give question
            let test = interaction.options.getString('test') ?? ''
            test = test.toLowerCase()
            const allowed = ['amc', 'aime', '']
            if(!allowed.includes(test)) {
                await interaction.editReply('That test is not currently supported. Currently supported tests are: AMC 10/12, AIME')
                return
            }

            //get list
            const reviewRef = doc(db, 'review', interaction.user.id)
            let reviewProbs = (await getDoc(reviewRef)).data().problems
            let probIndices = []
            for(var prob in reviewProbs) {
                if(test == '' || 
                    (test == 'amc' && parseInt(prob) < 10000) ||
                    (test == 'aime' && parseInt(prob) > 10000)) {
                    probIndices.push(prob)
                }
            }

            //get random problem index
            let index = probIndices[Math.floor(Math.random() * probIndices.length)]

            //get problem
            const problemRef = doc(db, 'problems', index.toString())
            let problem = (await getDoc(problemRef)).data()

            //give problem
            let yr = problem.year.toString().split('_')
            let testType = problem.test.toString()
            let testName;
            if(yr.length == 1) {
                testName = yr[0] + ' ' + testType
            } else if(yr.length == 2) {
                if(testType == 'AIME') {
                    testName = yr[0] + ' ' + testType + ' ' + yr[1]
                } else {
                    testName = yr[0] + ' ' + testType + yr[1]
                }
            } else {
                testName = yr[0] + ' ' + yr[1] + ' ' + testType + yr[2]
            }

            let points = problem.points
            const question = new EmbedBuilder()
            .setColor(0x14C7B2)
            .addFields(
                {name: 'Problem', value: testName + ' Problem ' + problem.problem.toString()},
                {name: 'Value', value: points.toString()},
            )

            let instructions = ''
            if(testType.substring(0, 3) == 'AMC') {
                instructions += 'Answer with a letter. Time limit: 6 minutes.'
            } else if(testType.substring(0, 4) == 'AIME') {
                instructions += 'Answer with a three digit integer. Add leading zeroes if necessary. Time limit: 20 minutes.'
            }
            instructions += '\nType \"skip\" to skip'
            question.addFields({name: '\u200b', value: instructions})

            question.setImage(problem.picture.toString())
            await interaction.editReply({embeds: [question]})

            //collect answer
            let maxTime = 0
            if(testType == 'AMC 10' || testType == 'AMC 12') {
                maxTime = 360000
            } else if(testType == 'AIME') {
                maxTime = 1200000
            }

            const filter = m => m.author.id == interaction.user.id
            const collector = interaction.channel.createMessageCollector({ filter, time: maxTime });

            collector.on('collect', m => {
                let msg = m.content
                if(msg.toLowerCase() == 'skip') {
                    collector.stop('skip')
                } else if(msg.toUpperCase() == problem.answer.toString()) {
                    collector.stop('correct')
                } else {
                    collector.stop('incorrect')
                }
            })

            collector.on('end', async (collected, code) => {
                const answer = new EmbedBuilder().setColor(0x14C7B2)
                
                const docRef = doc(db, 'points', interaction.user.id)
                let data = (await getDoc(docRef)).data()

                await updateDoc(docRef, {
                    problemsAttempted: data.problemsAttempted + 1
                })
                if(code) {
                    if(code == 'correct') {
                        answer.setDescription('Correct\nPoints added: ' + points.toString())
                        await updateDoc(docRef, {
                            points: data.points + points,
                            problemsSolved: data.problemsSolved + 1
                        })
                        
                        if(reviewProbs[index] == 2) {
                            reviewProbs[index] = 1
                        } else {
                            delete reviewProbs[index]
                        }
                    } else {
                        reviewProbs[index] = 2
                        if(code == 'skip') {
                            answer.setDescription('Skipped')
                        } else {
                            answer.setDescription('Incorrect')
                        }
                    }
                } else {
                    reviewProbs[index] = 2
                    answer.setDescription('Timeout')
                }

                await updateDoc(reviewRef, {
                    problems: reviewProbs
                })

                if(testType == 'AMC 10' || testType == 'AMC 12') {
                    let temp = testType.split(' ')
                    if(yr.length == 3) {
                        if(yr[1] == 'Spring') {
                            answer.addFields({name: 'Solution', value: 'https://artofproblemsolving.com/wiki/index.php/' + yr[0] + '_' + temp[0] + '_' + temp[1] + yr[2] + '_Problems/Problem_' + problem.problem.toString()})
                        } else {
                            answer.addFields({name: 'Solution', value: 'https://artofproblemsolving.com/wiki/index.php/' + yr[0] + '_' + yr[1] + '_'+ temp[0] + '_' + temp[1] + yr[2] + '_Problems/Problem_' + problem.problem.toString()})
                        }
                    } else {
                        answer.addFields({name: 'Solution', value: 'https://artofproblemsolving.com/wiki/index.php/' + yr[0] + '_' + temp[0] + '_' + temp[1] + yr[1] + '_Problems/Problem_' + problem.problem.toString()})
                    }
                } else if(testType == 'AIME') {
                    answer.addFields({name: 'Solution', value: 'https://artofproblemsolving.com/wiki/index.php/' + yr[0] + '_' + testType + '_' + (yr[1] ?? '') + '_Problems/Problem_' + problem.problem.toString()})
                }
                
                await interaction.followUp({embeds: [answer]})
            })
        }
	},
};