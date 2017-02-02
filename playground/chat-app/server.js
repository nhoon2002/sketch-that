var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3000);

console.log('sever running');

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected ', connections.length);

  // Disconnet
  socket.on('disconnect', function(data) {
     if(!socket.userName) return;
    users.splice(users.indexOf(socket.userName), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected %s sockets connected ', connections.length);
  });

  // Send message
  socket.on('send message', function(data) {
    console.log('message from ' + socket.userName+ ': ' + data);
    io.sockets.emit('new message', {msg: data, user: socket.userName});
  });

  // new user
  socket.on('new user', function(data, callback) {
    callback(true);
    socket.userName = data;
    users.push(socket.userName);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }

});
