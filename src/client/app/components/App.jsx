import React from 'react'
import Cards from './Cards.jsx'

export default class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      'cards': [
        { 'id': '1', 'name': 'Card 1' },
        { 'id': '2', 'name': 'Card 2' },
        { 'id': '3', 'name': 'Card 3' },
        { 'id': '4', 'name': 'Card 4' },
        { 'id': '5', 'name': 'Card 5' }
      ]
    }
  }

  render() {
    return (
      <div>
        <Cards cards={this.state.cards} />
      </div>
    )
  }
}
