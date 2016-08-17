const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const PATHS = {
  client: path.join(__dirname, 'src/client'),
  build: path.join(__dirname, 'public')
}

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: PATHS.client+'/app/index.ejs',
      title: 'HS collection',
      appMountId: 'app',
      inject: false
    })
  ],
  entry: {
    fetch: 'whatwg-fetch',
    app: path.join(PATHS.client, 'app/index.jsx')
  },
  devtool: 'eval-source-map',
  output: {
    path: PATHS.build,
    filename: '[name].[hash].js'
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
  }
}
