import restify from 'restify'

import fetch from 'node-fetch'
import cheerio from 'cheerio'

function getCountGroupByName(hearthPwnCollection) {
    let $ = cheerio.load(hearthPwnCollection)
    let result = {}
    $('.card-image-item.owns-card').each((i, el) => {
      let $el = $(el)
      let cardName = $el.data('cardName')
      let cardCount = parseInt($el.find('.inline-card-count').data('cardCount'), 10)
      result[cardName] = (result[cardName] || 0) + cardCount
    })

    return result
}

async function getCardsByUsername(req, res, next) {
  try {
    let hsJson = (await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json').then(x => x.json()))
      .filter(x => x.cost)

    let hearthPwnCollection = await fetch(`http://www.hearthpwn.com/members/${req.params.username}/collection`).then(x => x.text())
    let collectionCount = getCountGroupByName(hearthPwnCollection)

    let result = hsJson.map(el => ({
      'card': {
        'id': el.id,
        'name': el.name,
        'set': el.set,
        'class': el.playerClass,
        'type': el.type,
        'rarity': el.rarity,
        'cost': el.cost
      },
      'count': collectionCount[el.name]
    }))

    res.send(200, result)
  } catch (e) {
    res.send(400, e)
  }

  return next();
}


var server = restify.createServer()
server.get('api/v1/cards/:username', getCardsByUsername)

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url)
})
