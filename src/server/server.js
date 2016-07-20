import restify from 'restify'

import _ from 'lodash'
import fetch from 'node-fetch'
import cheerio from 'cheerio'


function getCountGroupByName(hearthPwnCollection) {
    let $ = cheerio.load(hearthPwnCollection)
    let result = {}
    $('.card-image-item.owns-card').each((i, x) => {
      let $x = $(x)
      let cardName = $x.data('cardName')
      let cardCount = parseInt($el.find('.inline-card-count').data('cardCount'), 10)
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

function getCollectionCount(username) {
  return fetch(`http://www.hearthpwn.com/members/${username}/collection`)
    .then(x => x.text())
    .then(x => getCountGroupByName(x))
    .then(x => throwIfEmpty(x, () => new Error(`There is no cards for username: ${username}`)))
}

function getHsJson() {
  return fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json')
    .then(x => x.json())
}

async function getCardsByUsername(req, res, next) {
  try {
    let collectionCount = await getCollectionCount(req.params.username)
    let hsJson = await getHsJson()

    let result = hsJson
      .filter(x => x.cost)
      .map(x => ({
        'card': _.pick(x, ['id', 'name', 'set', 'playerClass', 'type', 'rarity', 'cost']),
        'count': collectionCount[x.name]
      }))

    res.send(200, result)
  } catch(e) {
    res.send(400, e)
  }

  return next()
}


var server = restify.createServer({
  name: 'HS-Collection'
})
server.get('api/v1/cards/:username', getCardsByUsername)

server.listen(8080, function() {
  console.log(`${server.name} listening at ${server.url}`)
})
