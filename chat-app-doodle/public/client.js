//------------------------------------------------------------------------------
// JavaScript for the draw app -------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
   var mouse = {
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

   // draw line received from server
	socket.on('draw_line', function (data) {
      var line = data.line;
      console.log("line coordinates: " + JSON.stringify(data));
      context.beginPath();
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
   });

   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});

//------------------------------------------------------------------------------
// Section for chat app---------------------------------------------------------
var socket = io.connect();
var $messageForm = $('#messageForm');
var $message = $('#message');
var $chat = $('#chat');
var $messageArea = $('#messageArea');
var $userFormArea = $('#userFormArea');
var $userForm = $('#userForm');
var $users = $('#users');
var $userName = $('#userName');

// send messages to socket server
$messageForm.submit(function(e) {
  e.preventDefault();
  socket.emit('send message', $message.val());
  $message.val('');
});

// listen for data from socket server and display on page
socket.on('new message', function(data) {
  $chat.append('<div class="well"><strong>'+ data.user +': </strong>'+ data.msg + '</div>');
});

// send username to socket server
$userForm.submit(function(e) {
  e.preventDefault();
  socket.emit('new user', $userName.val(), function(data) {
    if(data){
      $userFormArea.hide();
      $messageArea.show();
    }
  });
  $userName.val('');
});
// disply users
socket.on('get users', function(data) {
  var html = '';
  for(var i = 0; i < data.length; i++) {
    html += '<li class="list-group-item">'+ data[i] +'</li>';
  }
  $users.html(html);
});
