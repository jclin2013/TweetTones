var path = require("path");

module.exports = {
  context: __dirname,
  entry: "./frontend/tweet_tones.js",
  output: {
    path: path.join(__dirname, 'lib', 'assets'),
    filename: "bundle.js",
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },
  module: {
    loaders: [
      {
        test: [/\.js?$/],
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  devtool: 'source-maps',
  node: {
    fs: "empty"
  },
  resolve: {
    extensions: ['.js', '*']
  }
};
