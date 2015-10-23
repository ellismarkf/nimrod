var path = require('path');
var reqHandler = require('express')();
var server = require('http').Server(reqHandler);
var io = require('socket.io')(server);


reqHandler.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});
reqHandler.get('/static/nimrod.js', function(req, res){
	res.sendFile(path.join(__dirname, '/dist/nimrod-compiled.js'));
});
reqHandler.get('/static/nimrod.css', function(req, res){
	res.sendFile(path.join(__dirname, '/dist/nimrod-compiled.css'));
})

server.listen(8080, 'localhost', function(err, result){
	if (err) {
		console.log(err)
	}
	console.log('Listening at localhost:8080')
});

io.listen(server);
io.on('connection', function (socket) {
    console.log('socket connected');
});