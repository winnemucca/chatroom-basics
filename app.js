var express = require('express');
var bodyParser = require('body-parser');
var indexController = require('./controllers/index.js');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', indexController.index);

var http= require('http').Server(app);
http.listen(3000, function(){
	console.log('listening on *:3000');
})
// requiring socket io must come after http
var io = require('socket.io')(http);

var usernames = {};
var numUsers = 0;

io.on('connection',function(socket){
	var addedUser = false;
	console.log('a user connected');

	socket.on('chat message', function(msg){
    	console.log('message: ' + msg);
    	// io.emit('chat message',msg);
    	socket.broadcast.emit('chat message',msg); 
  	});

  	socket.on('new message',function(data){
  		socket.broadcast.emit('new message',{
  			username: socket.username,
  			message:data
  		});
  	});

  	socket.on('add user',function(username){
  		socket.username = username;
  		usernames[username] = username;
  		++numUsers;
  		addedUSer = true;
  		socket.emit('login',{
  			numUsers: numUsers
  		});
  		socket.broadcast.emit('user joined',{
	  		username:socket.username,
	  		numUsers: numUsers
  		});
  	});

  	// when the client emits 'typing', we broadcast it to others
  	socket.on('typing', function () {
    	socket.broadcast.emit('typing', {
      	username: socket.username
    	});
  	});

  // when the client emits 'stop typing', we broadcast it to others
  	socket.on('stop typing', function () {
    	socket.broadcast.emit('stop typing', {
      	username: socket.username
    	});
  	});


  	socket.on('disconnect', function () {
    // remove the username from global usernames list
    	if (addedUser) {
      		delete usernames[socket.username];
      		--numUsers;

      // echo globally that this client has left
      		socket.broadcast.emit('user left', {
        	username: socket.username,
        	numUsers: numUsers
     	 	});
    	}
  	});
  	


});


// var server = app.listen(3000, function() {
// 	console.log('Express server listening on port ' + server.address().port);
// });
