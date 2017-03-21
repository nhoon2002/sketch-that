// Client side for the draw app
var socket  = io.connect();


var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false,
      color: "",
      radius: 10
    };

    // var canvasContainer = $('#drawing');
    // var width = canvasContainer.innerWidth();
    // var height = canvasContainer.innerHeight();

    // set canvas to full browser width/height
    var width = window.innerWidth;
    var height = window.innerHeight;

    // set canvas to full browser width/height
    canvas.width = width;
    canvas.height = height + 900;

    // width of the line drawn
    context.lineWidth = mouse.radius*2;

    // on mouse down set mouse click to true and set dragging to true
    canvas.onmousedown = function(e){
      mouse.click = true;
    };
    // on mouse up set mouse.click to false and disengage dragging
    canvas.onmouseup = function(e){
      mouse.click = false;
    };
    canvas.onmousemove = function(e){
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
    };

    // draw line received from server
    socket.on('draw_line', function(data) {
        var line = data.line;
        console.log('line from server: '+ line);
        var radius = data.radius;
        console.log('radius from server: '+radius);
        var color = data.color;
        console.log('color from server: '+ color);
        console.log("data from server: " + JSON.stringify(data));

        context.fillStyle = color;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.strokeStyle=color;
        context.stroke();
        context.arc(line[0].x * width, line[0].y * height, radius, 0, Math.PI*2);
        context.fill();

    });

    // main loop, running every 25ms
    function mainLoop() {
       // check if the user is drawing
       if (mouse.click && mouse.move && mouse.pos_prev) {
          // send line data to to the server
          socket.emit('draw_line', {
              line: [ mouse.pos, mouse.pos_prev ],
              radius: mouse.radius,
              color: mouse.color
          });
          mouse.move = false;
       }
       mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
       setTimeout(mainLoop, 25);
    }
    mainLoop();


// }); // end document.addEventListener
