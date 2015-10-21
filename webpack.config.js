const getConfig = require('hjs-webpack');

module.exports = getConfig({
	in: './src/js/main.js',
	out: 'public',
	clearBeforeBuild: '!(index.html)',
	isDev: process.env.NODE_ENV !== 'production',
	html: false
});