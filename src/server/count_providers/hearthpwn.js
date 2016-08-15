'use strict'

var fetch = require('node-fetch')
var cheerio = require('cheerio')
var _ = require('lodash')

module.exports = (username) => fetch(`http://www.hearthpwn.com/members/${username}/collection`)
  .then(x => x.text())
  .then(x => getCountGroupByName(x))
  .then(x => throwIfEmpty(x, () => new Error(`There are no cards for username: ${username}`)))


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
