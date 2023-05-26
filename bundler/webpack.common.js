const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require("terser-webpack-plugin")
const path = require('path')

const env = process.env.NODE_ENV || 'production'

const folders = [
  'case/echosight/index.html',
  'case/rp-chauffeurs/index.html',
  'case/ceam-academic/index.html',
  'case/ecommerce/index.html',
  'case/game-wiki-and-build-editor/index.html',
  'case/bugtracker/index.html',
  'case/shader-fbm/index.html',
].map(filename =>
  new HtmlWebpackPlugin({ filename, template: path.resolve(__dirname, '../views/index.pug') })
)

module.exports = {
  entry: [
    path.resolve(__dirname, '../src/app.js'),
    path.resolve(__dirname, '../styles/index.scss'),
  ],

  output: {
    hashFunction: 'xxhash64',
    // filename: 'bundle.js',
    filename: env === 'development' ?
      'bundle.js' : 'bundle.[contenthash].js',
    path: path.resolve(__dirname, '../dist')
  },

  devtool: 'source-map',

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../static') },
      ]
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../views/index.pug'),
      minify: true
    }),

    ...folders,

    new MiniCSSExtractPlugin({
      filename: 'index.css',
      chunkFilename: '[id].css'
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },

      {
        test: /\.pug$/,
        use: ['@webdiscus/pug-loader'],
        // use: ['pug-loader'],
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.(jpe?g|png|gif|svg|fnt|webp)$/,
        type: 'asset',
        generator: {
          filename: 'assets/images/[hash][ext]'
        },
      },

      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset',
        generator: {
          filename: 'assets/fonts/[hash][ext]'
        },
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
}
