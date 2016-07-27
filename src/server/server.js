'use strict'

var restify = require('restify')
var _ = require('lodash')
var fetch = require('node-fetch')
var cheerio = require('cheerio')


function getCountGroupByName(hearthPwnCollection) {
    let $ = cheerio.load(hearthPwnCollection)
    let result = {}
    $('.card-image-item').each((i, x) => {
      let $x = $(x)
      let cardName = $x.data('cardName')
      let cardCount = parseInt($x.find('.inline-card-count').data('cardCount'), 10)
      result[cardName] = (result[cardName] || 0) + cardCount
    })

    return result
}

function throwIfEmpty(o, error) {
  if (_.isEmpty(o)) {
    throw error()
  }

  return o
}

function mergeCollection(collections) {
  let result = {}
  for (let collection of collections) {
    for (let x in collection) {
      result[x] = (result[x] || []).concat(collection[x])
    }
  }

  return result
}

function getCollectionCount(username) {
  return fetch(`http://www.hearthpwn.com/members/${username}/collection`)
    .then(x => x.text())
    .then(x => getCountGroupByName(x))
    .then(x => throwIfEmpty(x, () => new Error(`There are no cards for username: ${username}`)))
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
    // .filter(x => x.count > 0)
    // .filter(x => x.card.rarity === 'EPIC' || x.card.rarity === 'LEGENDARY')
    // .sort((a,b) => a.card.cost - b.card.cost)
}

function getCardsByUsername(usernames) {
  let collectionByUsername = usernames.map(u => getCollectionCount(u))
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

function resp(promise, res, next) {
  promise
    .then(val => res.send(val))
    .then(() => next())
    .catch(e => next(e))
}

function respDummy(req, res, next) {
  let dummyResult = JSON.parse(require('fs').readFileSync('dummy.json', 'utf8'));
  resp.send(dummyResult)
  next()
}

var server = restify.createServer({
  name: 'HS-Collection'
})
server.use(restify.queryParser())
server.use(restify.CORS())
server.get('api/v1/cards', respCardsByUsername)
server.get('api/v1/dummy', respDummy)

server.listen(8081, function() {
  console.log(`${server.name} listening at ${server.url}`)
})
