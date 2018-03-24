var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
usersplay = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('server running');

app.use(express.static('src'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		var index = users.indexOf(socket.username);
		users.splice(index, 1);
		usersplay.splice(index, 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	// Send Message
	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	// New User
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		usersplay.push(0);
		updateUsernames();
	});

	socket.on('playpianonote', function(data){
		var username = socket.username;
		var chord = data.chord;
		var bpm = data.chordbpm;

		playpiano(data, username);
		updateCurrentPlay(username);
	});

	function playpiano(data, user){
		var note = data.key;
		var sustain = data.sustain;
		var harmony = data.harmony;
		var chord = data.chord;
		var bpm = data.chordbpm;
		socket.broadcast.emit('sendpianonote', {key: note, sustain: sustain, harmony: harmony, username: user, chord: chord, bpm: bpm});
	}

	function updateCurrentPlay(user) {
		var index = users.indexOf(user);
		++usersplay[index];

		setTimeout(function(){
			var indexafter = users.indexOf(user);
			--usersplay[indexafter];
			if (usersplay[indexafter] == 0) {
				io.sockets.emit('Turn off speaker', user);
			}

		},5000);
	}

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});