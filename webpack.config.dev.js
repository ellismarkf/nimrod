var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
	devtool: 'eval',
	entry: [
		'./src/js/main.js'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'nimrod.js',
		publicPath: '/static/'
	},
	module: {
		loaders: [
			{ 
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loaders: ['babel'],
				include: path.join(__dirname, 'src')
			},
			{
				test: /\.less$/,
				loaders: ['style', 'css', 'less']
			}
		]
	},
	plugins: [
		new ExtractTextPlugin('styles.css')
	]
}