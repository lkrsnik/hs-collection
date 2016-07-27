import React from 'react'
import 'whatwg-fetch';

export default class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      cards: []
    }
  }

  componentDidMount() {
    this.serverRequest = fetch('http://localhost:8081/api/v1/cards?u=majcn&u=krsniiik&u=Pandaa12')
      .then(x => x.json())
      .then(x => this.setState({'cards': x}))
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  render() {
    return (
      <div>
        {this.state.cards.map(c =>
          <div>
            <img src={ require('../resources/slike/' + c.card.id + '.png') } /> 
            <div> {c.count.join(',')} </div>
          </div>
        )}
      </div>
    )
  }
}
