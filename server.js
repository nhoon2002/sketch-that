var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require("path");



app.use(express.static("./public"));

app.get("/", function(req, res) {
 res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/gameplay", function(req, res) {
 res.sendFile(path.join(__dirname + "/views/gameplay.html"));
});

app.get("/dashboard", function(req, res) {
   res.sendFile(path.join(__dirname + "/views/dashboard.html"));
});

var users = [];
var connections = [];

// store draw history
var line_history = [];


io.sockets.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected ', connections.length);
  console.log('Users' +users);

  // Disconnet
  socket.on('disconnect', function(data) {
     if(!socket.userName) return;
    users.splice(users.indexOf(socket.userName), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected %s sockets connected ', connections.length);
  });



  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
  // -----------------------------------------------------------------------------
  //--- Draw ---------------------------------------------------------------------
   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }
   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });
});

server.listen(process.env.PORT || 3000, function(err, res) {
  console.log('Listening on Port 3000');
});
