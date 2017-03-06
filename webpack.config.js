var webpack = require('webpack');
var path = require('path');
var BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
	entry: './js/run_php_code.js',
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
			}
		]
	},
	plugins: [
		new BabiliPlugin({})
	]
};