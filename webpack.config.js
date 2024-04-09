//@ts-check

'use strict';

const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');
const Dotenv = require('dotenv-webpack');

const EnvDefault = {
  /** @type {string} */
  NODE_ENV: '',
  /** @type {string} */
  DEBUG: '',
  /** @type {boolean} */
  isDev: false,
  /** @type {boolean} */
  isDebug: false,
  /** @type {string|false} */
  devtool: false,
};

/** @type {string} String of env-var NODE_ENV */
const _node_env_ = String(process.env.NODE_ENV || EnvDefault.NODE_ENV);
/** @type {boolean} Bool of env-var NODE_ENV*/
let _isDev_ = EnvDefault.isDev;

/** @type {string} String of env-var DEBUG */
const _debug_ = String(process.env.DEBUG || EnvDefault.DEBUG);
/** @type {boolean} Bool of env-var DEBUG */
let _isDebug_ = EnvDefault.isDebug;

/** @type {string|false} If and how source maps are generated */
let _devtool_ = EnvDefault.devtool;

switch (_node_env_.replace(/['"]+/g, '').trim().toLowerCase()) {
  case 'production':
  case 'prod':
    _isDev_ = false;
    _devtool_ = false;
    break;
  case 'development':
  case 'dev':
    _isDev_ = true;
    _devtool_ = 'eval-source-map';
    break;
  default:
    _isDev_ = EnvDefault.isDev;
    _devtool_ = EnvDefault.devtool;
}

switch (_debug_.replace(/['"]+/g, '').trim().toLowerCase()) {
  case 'true':
  case 'yes':
  case 'on':
  case '1':
    _isDebug_ = true;
    break;
  case 'false':
  case 'no':
  case 'off':
  case '0':
    _isDebug_ = false;
    break;
  default:
    _isDebug_ = EnvDefault.isDebug;
}

console.log(`[Webpack.config.js] NODE_ENV=${_node_env_} DEBUG=${_debug_}\n`);
console.table({ 
  // _node_env_, 
  // _isDev_, 
  // _debug_, 
  // _isDebug_, 
  // _devtool_, 
  NODE_ENV: process.env.NODE_ENV, 
  DEBUG: process.env.DEBUG
});


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv({
      path: './.env',
      safe: true // make sure to have a .env.example with all keys
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(_node_env_),
      'process.env.DEBUG': JSON.stringify(_debug_),
  }),
  ],
  devtool: _devtool_,
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};
module.exports = [ extensionConfig ];