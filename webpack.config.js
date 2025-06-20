import path from 'path';
import { fileURLToPath } from 'url';
import { CardFilename } from './src/card-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/card.js',
  output: {
    filename: CardFilename,
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    devMiddleware: {
      writeToDisk: true
    },
    client: {
      logging: 'verbose',
      overlay: {
        errors: true,
        warnings: true
      },
      progress: true,
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 9000
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: 'current'
                }
              }]
            ],
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
    extensions: ['.js', '.mjs'],
    alias: {
      'lit': path.resolve(__dirname, 'node_modules/lit')
  }
  },
  experiments: {
    topLevelAwait: true
  },
  devtool: 'source-map'
}; 