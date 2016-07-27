import React from 'react'
import Card from './Card.jsx'

export default ({cards}) => {
  return (
    <ul>{cards.map(card =>
      <li key={card.id}>
        <Card card={card.name} />
      </li>
    )}</ul>
  )
}
