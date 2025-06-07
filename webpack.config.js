const path = require('path');
const { CardFilename } = require('./src/card-config');

module.exports = {
  mode: 'production',
  entry: './src/card.js',
  output: {
    filename: CardFilename,
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true, legacy: false }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-proposal-private-methods', { loose: true }],
              ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
}; 