'use strict';
var path = require('path');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var _ = require('lodash');
var port = process.env.PORT || 5000;
app.use(express.static(__dirname + "/dist"));
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/dist/nimrod-compiled.js', function(req, res){
	res.sendFile(path.join(__dirname, '/dist/nimrod-compiled.js'));
});
io.sockets.on('connection', function(socket){
	let client = socket;
    client.emit('connected', { message: "You are connected!", mySocketId: client.id });

    client.on('hostRequestNewRoom', (data) => {
    	var roomId = ( Math.random() * 100000 ) | 0;
    	client.join(roomId.toString());
    	io.sockets.emit('newRoomCreated', {gameId: roomId});
    	client.broadcast.emit('redraw', { rows: data.rows, players: data.players });
    });

    client.on('playerJoinGame', (data) => {
    	client.join(data.gameId.toString());
    	if ( _.every(data.players, (value, index, array) => { return array[index].joined === true }) && data.players.length === 2 ){
    		io.to(data.gameId.toString()).emit('gameReady', { rows: data.rows, players: data.players });
    	}
    });

    client.on('updateBoard', (data) => {
    	io.to(data.gameId.toString()).emit('redraw', {rows: data.rows});
    });

    client.on('turnEnded', (data) => {
    	io.to(data.gameId.toString()).emit('startNextTurn', { players: data.players, role: data.role });
    });
    client.on('gameOver', (data) => {
    	io.to(data.gameId.toString()).emit('gameOver', { role: data.role });
    });
});
server.listen(port);
module.exports = app;