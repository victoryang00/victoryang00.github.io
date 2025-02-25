const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './gpt/main.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './gpt/index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: path.resolve(__dirname, 'node_modules/@wllama/wllama/esm/single-thread/wllama.wasm'),
          to: 'wllama/single-thread/'
        },
        { 
          from: path.resolve(__dirname, 'node_modules/@wllama/wllama/esm/multi-thread/wllama.wasm'),
          to: 'wllama/multi-thread/'
        }
      ]
    })
  ],
  devServer: {
    static: './dist',
    hot: true
  }
};