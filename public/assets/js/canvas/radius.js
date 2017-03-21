

var setRadius = function(newRadius) {
  if(newRadius<minRadius)
      newRadius = minRadius;
  else if(newRadius>maxRadius)
      newRadius = maxRadius;
  mouse.radius = newRadius;
  console.log('radius from radius.js: '+mouse.radius);
  context.lineWidth = mouse.radius*2;

  radSpan.innerHTML = mouse.radius;
};

var minRadius = 0.5;
var maxRadius = 10;
var defaultRad = 5;
var interval = 0;
var radSpan = document.getElementById('radval');
var decrad = document.getElementById('decrad');
var incrad = document.getElementById('incrad');

decRad.addEventListener('click', function() {
  setRadius(mouse.radius-interval);
});

incRad.addEventListener('click', function() {
  setRadius(mouse.radius+interval);
});

setRadius(defaultRad);
