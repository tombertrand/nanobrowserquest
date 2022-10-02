require("dotenv").config();

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    vendor: ["jquery", "bignumber.js"],
    app: "./client/js/index.ts",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist/client"),
    },
    compress: true,
    port: 8010,
    // proxy: {
    //   "/": "http://localhost:8000",
    // },

    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,
          safari10: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "file-loader",
        options: {
          name: "img/[name].[ext]",
        },
      },
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
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, { loader: "css-loader", options: { url: false, sourceMap: true } }],
      },
    ],
  },
  output: {
    filename: "[name].[hash].bundle.js",
    path: path.resolve(__dirname, "dist/client"),
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
    new MiniCssExtractPlugin({
      filename: "css/[name].[hash].bundle.css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "client/img/", to: "img/" },
        { from: "client/audio/", to: "audio/" },
        { from: "client/fonts/", to: "fonts/" },
        { from: "client/maps/", to: "maps/" },
        { from: "client/js/mapworker.js", to: "mapworker.js" },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.SENTRY_DNS": JSON.stringify(process.env.SENTRY_DNS),
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./client/index.html",
    }),
    new HtmlWebpackPlugin({
      filename: "index_ban.html",
      template: "./client/index_ban.html",
    }),
  ],
};
