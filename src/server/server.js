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

async function test(username) {
  try {
    let hsJson = (await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json').then(x => x.json()))
      .filter(x => x.cost)

    let hearthPwnCollection = await fetch(`http://www.hearthpwn.com/members/${username}/collection`).then(x => x.text())
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

    console.log(result)
  } catch (e) {
    console.log(e)
  }
}

test('majcn')