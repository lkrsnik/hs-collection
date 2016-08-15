'use strict'

const players = ['majcn', 'krsniiik', 'Pandaa12']
const noCards = 10

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

  return _.sampleSize(result, noCards)
})

Promise.all([hsJsonPromise, cardNamesPromise]).then(x => {
  let hsJson = x[0]
  let cardNames = x[1]

  let cards = cardNames.map(cardName => hsJson.find(c => c.name === cardName))
  for (let card of cards) {
  	console.log(`<img src="http://wow.zamimg.com/images/hearthstone/cards/enus/original/${card.id}.png"/>`)
  }
})
