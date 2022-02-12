const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  // context: path.resolve(__dirname, 'client/js'),
  entry: {
    vendor: [
      "jquery",
      "jquery-ui",
      "jquery-countdown",
      "jquery.qrcode",
      "jquery-ui-touch-punch",
      "bignumber.js",
      "socket.io",
    ],
    app: "./client/js/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery'",
      "window.$": "jquery",
    }),
    //  new MiniCssExtractPlugin(miniCssExtractOptions),
  ],
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
  },
};
