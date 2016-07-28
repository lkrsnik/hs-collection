const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const PATHS = {
  client: path.join(__dirname, 'src/client'),
  build: path.join(__dirname, 'public')
}

module.exports = {
  entry: {
    app: path.join(PATHS.client, 'app/index.jsx')
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
        include: PATHS.client
      },
      {
        test: /\.(jpg|png|svg|ttf|woff|woff2|eot)$/,
        loaders: ['file-loader'],
        include: PATHS.client
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel?cacheDirectory'],
        include: PATHS.client
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'node_modules/html-webpack-template/index.ejs',
      title: 'HS collection',
      appMountId: 'app',
      inject: false
    })
  ]
}
