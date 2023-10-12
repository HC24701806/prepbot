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

const { getFirestore, doc, setDoc } = require("firebase/firestore")
const db = getFirestore(app)

const f = require('fs')

//year + other info (e.g. a/b)
let tests = []
for(let yr = 2000; yr <= 2022; ++yr) {
    if(yr < 2002) {
        tests.push(String(yr))
    } else if(yr == 2021) {
        tests.push(String(yr) + '_Spring_A')
        tests.push(String(yr) + '_Spring_B')
        tests.push(String(yr) + '_Fall_A')
        tests.push(String(yr) + '_Fall_B')
    } else {
        tests.push(String(yr) + '_A')
        tests.push(String(yr) + '_B')
    }
}

type = 12 //test type
let index = 1151
tests.forEach(function(test) {
    //get answers
    let file = 'C:/prepbot/amcscrape/AMC/' + type + '/' + test + '/solutions.txt'
    let answerKey = f.readFileSync(file, 'utf8').split('\r\n')

    for(let problem = 1; problem <= 25; ++problem) {
        //point system
        let points = 200/(1 + Math.exp(-0.3 * (problem - 15.5))) + 120
        let yr = parseInt(test.substring(0, 4))
        if(yr <= 2017) {
            points *= 0.925
        } else if(yr <= 2010) {
            points *= 0.85
        }
        points = Math.round(points)

        //store problem in firestore
        setDoc(doc(db, 'problems', index.toString()), {
            answer: answerKey[problem - 1],
            picture: 'https://storage.googleapis.com/prepbot-2a03b.appspot.com/AMC%20' + type + '/' + test + '/' + problem + '.png',
            points: points,
            problem: problem,
            test: 'AMC ' + type,
            year: test
        })
        index++
    }
})