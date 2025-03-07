/* eslint-disable linebreak-style */
/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({})],
  },
});
