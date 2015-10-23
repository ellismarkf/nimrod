'use strict';
var path = require('path');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var gameSocket = require('./src/js/components/socket');
var _ = require('lodash');
if (process.env.NODE_ENV === 'development') {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/static/nimrod.js', function(req, res){
	res.sendFile(path.join(__dirname, '/dist/nimrod-compiled.js'));
});
io.sockets.on('connection', function(socket){
	console.log('socket connection established');
	let client = socket;
    client.emit('connected', { message: "You are connected!", mySocketId: client.id });

    // Host Events
    client.on('hostRequestNewRoom', (data) => {
    	var thisGameId = ( Math.random() * 100000 ) | 0;
    	client.join(thisGameId.toString());
    	io.sockets.emit('newRoomCreated', {gameId: thisGameId});
    	client.broadcast.emit('redraw', { rows: data.rows, players: data.players });
    });
    // gameSocket.on('hostRoomFull', hostPrepareGame);
    // gameSocket.on('hostCountdownFinished', hostStartGame);
    // gameSocket.on('hostNextRound', hostNextRound);

    // // Player Events
    client.on('playerJoinGame', (data) => {
    	client.join(data.gameId.toString());
    	if ( _.every(data.players, (value, index, array) => { return array[index].joined === true }) && data.players.length === 2 ){
    		io.to(data.gameId.toString()).emit('gameReady', { rows: data.rows, players: data.players });
    	}
    });

    client.on('updateBoard', (data) => {
    	io.to(data.gameId.toString()).emit('redraw', {rows: data.rows});
    })
});

server.listen(3000, function(err, result){
	if (err) { console.log(err) }
	console.log('express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
module.exports = app;