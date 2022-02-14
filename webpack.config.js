const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    vendor: ["jquery", "bignumber.js"],
    app: "./client/js/index.ts",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 8000,
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        exclude: /node_modules/,
        options: {
          esModule: true,
        },
        type: "javascript/auto",
      },
    ],
  },
  output: {
    filename: "[name].[hash].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  resolve: {
    fallback: {
      fs: false,
      http: false,
      zlib: false,
      path: false,
      stream: false,
      url: false,
      querystring: false,
      crypto: false,
    },
    extensions: [".ts", ".js", ".json"],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery'",
      "window.$": "jquery",
    }),
    new HtmlWebpackPlugin({
      // title: 'Fate of the Four',
      template: "./client/index.html",
    }),
    //  new MiniCssExtractPlugin(miniCssExtractOptions),
    new CopyWebpackPlugin({
      patterns: [
        { from: "client/img/", to: "img/" },
        { from: "client/audio/", to: "audio/" },
        { from: "client/css/", to: "css/" },
        { from: "client/fonts/", to: "fonts/" },
        { from: "client/maps/", to: "maps/" },
        { from: "client/js/mapworker.js", to: "mapworker.js" },
        // {from: 'client/sprites/', to: 'sprites/'},
        // {from: 'client/ts/lib/', to: 'lib/'},
        // {from: `client/config/config.prod.json`, to: 'client/config/config.json'},
      ],
    }),
  ],
};
