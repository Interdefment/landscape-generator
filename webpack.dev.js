process.env.NODE_ENV = 'development';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './developing',
		hot: true
	},
	plugins: [
    // new CleanWebpackPlugin(['./developing']),
    new HtmlWebpackPlugin({
			template: 'src/index.html'
    }),
		new webpack.HotModuleReplacementPlugin()
	],
});