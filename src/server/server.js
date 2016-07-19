import "babel-polyfill"; // need for Object.values

import fetch from 'node-fetch'
import jsdom from './jsdom-promise'

function mergeResults(hsJson, hearthPwnCollection) {
  let result = {}
  for (let i of hearthPwnCollection.document.querySelectorAll('.card-image-item')) {
    let cardName = i.getAttribute('data-card-name')

    let resultItem = result[cardName] || {
      'hsJson': hsJson.find(el => el.name === cardName),
      'hearthpwn' : {
        'count': 0
      }
    }

    if (!resultItem.hsJson) {
      throw `Card '${cardName}' does not exists in database`
    }

    let count = parseInt(i.querySelector('.inline-card-count').getAttribute('data-card-count'))
    resultItem.hearthpwn.count += count

    let isGold = i.getAttribute('data-is-gold') === 'True'
    if (!isGold) {
      resultItem.hearthpwn.imgUrl = i.querySelector('a img').getAttribute('src')
    }

    result[cardName] = resultItem
  }

  return result;
}

async function test(username) {
  try {
    let hsJson = await fetch('https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json')
      .then(x => x.json())

    let hearthPwnCollection = await fetch(`http://www.hearthpwn.com/members/${username}/collection`)
      .then(x => x.text())
      .then(html => jsdom(html))

    let result = mergeResults(hsJson, hearthPwnCollection)

    console.log(JSON.stringify(Object.values(result)))
  } catch (e) {
    console.log(e)
  }
}

test('majcn')