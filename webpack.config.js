var webpack = require('webpack');
var path = require('path');
var BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
	entry: './js/run-php-code.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/, 
				use: 'babel-loader'
			},
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.(jpg|png|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 25000,
				}
			},
		]
	},
	plugins: [
		new BabiliPlugin({})
	]
};