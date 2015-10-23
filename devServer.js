var path = require('path');
var reqHandler = require('express')();
var server = require('http').Server(reqHandler);
var io = require('socket.io')(server);

var webpack = require('webpack');
var config = require('./webpack.config.dev');
var compiler = webpack(config);
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');


reqHandler.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath,
	stats: { colors: true }
}));

reqHandler.use(webpackHotMiddleware(compiler, {
  	log: console.log, 
  	path: '/__webpack_hmr', 
  	heartbeat: 10 * 1000
}));

reqHandler.get('*', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, 'localhost', function(err, result){
	if (err) {
		console.log(err)
	}
	console.log('Listening at localhost:3000')
});

var socket = io.listen(server);
socket.on('connection', function (client) {
    console.log('got websocket connection');
   	client.on('hostJoined', function(host){
   		console.log(host);
   	});
});