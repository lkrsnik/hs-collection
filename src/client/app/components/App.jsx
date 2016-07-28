import React from 'react'
import 'whatwg-fetch'

import _ from 'lodash'

import { Grid, Row, Col, Thumbnail } from 'react-bootstrap';

export default class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      cards: []
    }
  }

  componentDidMount() {
    this.serverRequest = fetch('http://localhost:8081/api/v1/dummy') //cards?u=majcn&u=krsniiik&u=Pandaa12')
      .then(x => x.json())
      .then(x => this.setState({'cards': x}))
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  render() {
    return (
      <Grid>
        <Row>
        {
          this.state.cards.filter(c => _.min(c.count) > 0)
            .sort((a,b) => a.card.cost - b.card.cost)
            .sort((a,b) => a.card.playerClass.localeCompare(b.card.playerClass))
            .map(c =>
              <Col md={2}>
                <Thumbnail src= { require('../../resources/images/' + c.card.id + '.png') } alt="242x200">
                  <h4>{c.card.playerClass}</h4>
                  <p>Count: [{c.count.join(' ')}] => <strong>[{_.min([_.min(c.count), 2])}]</strong></p>
                </Thumbnail>
              </Col>
            )
        }
        </Row>
      </Grid>
    )
  }
}
