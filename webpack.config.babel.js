const path = require('path');

const PATHS = {
  app: path.join(__dirname, 'src/client/app'),
  build: path.join(__dirname, 'public')
}

module.exports = {
  entry: {
    app: PATHS.app + '/index.jsx'
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel?cacheDirectory'],
        include: PATHS.app
      }
    ]
  }
}
