'use strict'

const players = ['majcn', 'krsniiik', 'Pandaa12']
const classes = ['DRUID', 'HUNTER', 'MAGE', 'PALADIN', 'PRIEST', 'ROGUE', 'SHAMAN', 'WARLOCK', 'WARRIOR']
const noClassCards = 30
const noNeutralCards = 60

const headerString = "<a href='index.html'><img width='128' height='128' src='http://cdn.mos.cms.futurecdn.net/291541df0bafe9518cb896f3141ddb27-650-80.png'></a> <a href='class0.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/149/druid_22.png'></a> <a href='class1.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/150/hunter_4.png'></a> <a href='class2.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/151/mage_13.png'></a> <a href='class3.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/152/paladin_10.png'></a> <a href='class4.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/153/priest_12.png'></a> <a href='class5.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/154/rogue_8.png'></a> <a href='class6.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/155/shaman_5.png'></a> <a href='class7.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/156/warlock_21.png'></a> <a href='class8.html'><img width='128' height='128' src='http://media-hearth.cursecdn.com/attachments/0/157/warrior_11.png'></a><br />"

const fs = require('fs')
const fetch = require('node-fetch')
const _ = require('lodash')
const countProvider = require('../server/count_providers/hearthpwn.js')

let hsJsonPromise = fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json')
  .then(x => x.json())
  .then(x => x.filter(xx => 'cost' in xx))

let cardNamesPromise = Promise.all(players.map(u => countProvider(u))).then(collections => {
  let counts = {}
  for (let collection of collections) {
    for (let x in collection) {
      counts[x] = (counts[x] || []).concat(collection[x])
    }
  }

  let result = []
  let minCount = _.mapValues(counts, x => _.min(x.concat(2))) // max 2
  for (let cardName in minCount) {
    for (let i = 0; i < minCount[cardName]; i++) {
      result.push(cardName)
    }
  }

  return result
})

function filterCards (playerClass, cards, noCards) {
  let classCards = []
    for (let card of cards) {
      if (card.playerClass === playerClass)
        classCards.push(card)
    }
    return _.sampleSize(classCards, noCards).sort((a, b) => (a.cost - b.cost === 0) ? (a.name > b.name ? 1 : -1)  : a.cost - b.cost) // sort cards
}

function write(title, str) {
  fs.writeFile(title, str, function(err) {
    if(err) {
        return console.log(err);
    }

    //console.log("The file was saved!")
  }) 
}



Promise.all([hsJsonPromise, cardNamesPromise]).then(x => {
  let hsJson = x[0]
  let cardNames = x[1]

  let cards = cardNames.map(cardName => hsJson.find(c => c.name === cardName))
  let allClassCards = []
  for (let playerClass of classes) {
    allClassCards.push(filterCards(playerClass, cards, noClassCards))
  }
  let neutralCards = filterCards('NEUTRAL', cards, noNeutralCards)

  let neutralCardsString = ""
  for (let card of neutralCards) {
    neutralCardsString += `<img src="http://wow.zamimg.com/images/hearthstone/cards/enus/original/${card.id}.png"/>` + '\n'
  }

  let allClassCardsString = ""
  let number = 0

  for (let classCards of allClassCards) {
    let classCardsString = ""
    for (let card of classCards) {
      classCardsString += `<img src="http://wow.zamimg.com/images/hearthstone/cards/enus/original/${card.id}.png"/>` + '\n'
    }
    write('class' + number + '.html', headerString + classCardsString + neutralCardsString)
    number++
    allClassCardsString += classCardsString
  }
  write('index.html', headerString + allClassCardsString + neutralCardsString)
})
