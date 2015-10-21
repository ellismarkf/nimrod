var path = require('path');
var server = require('express')();
var webpack = require('webpack');
var config = require('./webpack.config');
var compiler = webpack(config);
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

server.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath,
	stats: { colors: true }
}));

server.use(webpackHotMiddleware(compiler, {
  	log: console.log, 
  	path: '/__webpack_hmr', 
  	heartbeat: 10 * 1000
}));

server.get('*', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, 'localhost', function(err, result){
	if (err) {
		console.log(err)
	}
	console.log('Listening at localhost:3000')
});
