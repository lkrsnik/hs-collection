'use strict'

const players = ['majcn', 'krsniiik', 'Pandaa12']
const noCards = 10

const _ = require('lodash')
const countProvider = require('../server/count_providers/hearthpwn.js')


Promise.all(players.map(u => countProvider(u))).then(collections => {
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

  console.log(_.sampleSize(result, noCards))
})
