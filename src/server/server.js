'use strict'

var restify = require('restify')
var _ = require('lodash')
var fetch = require('node-fetch')

var countProvider = require('./count_providers/hearthpwn.js')


function mergeCollection(collections) {
  let result = {}
  for (let collection of collections) {
    for (let x in collection) {
      result[x] = (result[x] || []).concat(collection[x])
    }
  }

  return result
}

function getHsJson() {
  return fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json')
    .then(x => x.json())
    .then(x => x.filter(xx => 'cost' in xx))
}

function createResult(collectionCount, hsJson) {
  return hsJson
    .map(x => ({
      'card': _.pick(x, ['id', 'name', 'set', 'playerClass', 'type', 'rarity', 'cost']),
      'count': collectionCount[x.name]
    }))
}

function getCardsByUsername(usernames) {
  let collectionByUsername = usernames.map(u => countProvider(u))
  let collectionCount = Promise.all(collectionByUsername)
    .then(x => mergeCollection(x))

  let hsJson = getHsJson()

  return Promise.all([collectionCount, hsJson])
    .then(x => createResult(x[0], x[1]))
}

function respCardsByUsername(req, res, next) {
  let usernames = [].concat(req.query.u)
  let resultPromise = getCardsByUsername(usernames)
  resp(resultPromise, res, next)
}

function randomPool(collection, limit) {
  let result = []
  for (let card of collection) {
    let count = _.min((card.count || [0]).concat(card.card.rarity === 'LEGENDARY' ? 1 : 2))
    for (let i = 0; i < count; i++) {
      result.push(card.card)
    }
  }

  return _.sampleSize(result, limit)
    .sort((a,b) => a.playerClass.localeCompare(b.playerClass))
    .sort((a,b) => a.cost - b.cost)
}

function respRandomPool(req, res, next) {
  let usernames = [].concat(req.query.u)
  let limit = /^(0|[1-9]\d*)$/.test(req.params.limit) ? parseInt(req.params.limit, 10) : 0

  let resultPromise = getCardsByUsername(usernames).then(c => randomPool(c, limit))
  resp(resultPromise, res, next)
}

function resp(promise, res, next) {
  promise
    .then(val => res.json(val))
    .then(() => next())
    .catch(e => next(e))
}

function respDummy(req, res, next) {
  let dummyResult = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'dummy/dummy.json'), 'utf8'));
  res.json(dummyResult)
  next()
}

var server = restify.createServer({
  name: 'HS-Collection'
})
server.use(restify.queryParser())
server.use(restify.CORS())
server.get('/api/v1/cards', respCardsByUsername)
server.get('/api/v1/dummy', respDummy)
server.get('/api/v1/randompool/:limit', respRandomPool)

// server.on('uncaughtException', (req, res, route, err) => {
//   console.log(err)
// })

server.listen(8081, function() {
  console.log(`${server.name} listening at ${server.url}`)
})
