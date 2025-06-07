const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/tgeditor-card.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tgeditor-card.js',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/tgeditor-card.js',
          to: 'tgeditor-card.js'
        }
      ]
    })
  ]
}; 