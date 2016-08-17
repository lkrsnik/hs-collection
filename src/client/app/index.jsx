import '../resources/css/bootstrap.min.css'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App.jsx'

require('style!css!sass!./styles/style.scss')

ReactDOM.render(<App />, document.getElementById('app'))
