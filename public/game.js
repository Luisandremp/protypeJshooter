const socket = io();
let worldObjects = new Array();

socket.emit('new player');

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 30);

const movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  click: false,
  clickX: 0,
  clickY: 0
}

document.addEventListener('mousedown', function(event){
 movement.click = true;
});
document.addEventListener('mouseup', function(event){
movement.click = false;
});
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 81: // Q
      movement.left = true;
      break;
    case 90: // Z
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break; 
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 81: // Q
      movement.left = false;
      break;
    case 90: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 49: // 1
      team = 1;
      socket.emit('team', team);
      break;
    case 50: // 2
      team = 2;
      socket.emit('team', team);
      break;
  }
});

/**
*
* Draw Elements
*
*/

const canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

const context = canvas.getContext('2d');


socket.on('world', function(objs) {
  worldObjects = objs;

});


socket.on('state', function(players, bullets) {

context.clearRect(0, 0, 800, 600);

  for (const obj in worldObjects) {
    if (worldObjects[obj].points == 0) {
context.fillStyle = 'gray';
    }else{
      switch (worldObjects[obj].team) {
        case 1:
          context.fillStyle = 'green';
          break;
        case 2:
          context.fillStyle = 'red';
          break;
        default:
          context.fillStyle = 'gray';
          break;
      }
    }
    

    context.fillRect(worldObjects[obj].x, worldObjects[obj].y, worldObjects[obj].width, worldObjects[obj].height);
    for (let i =0; i < worldObjects[obj].points; i++ ){
      context.fillRect(worldObjects[obj].x+(i*worldObjects[obj].width/10) , worldObjects[obj].y-10, worldObjects[obj].width/10, 5);
    }
    context.fill();
  }

  for (const id in players) {
    const player = players[id];
    switch (player.team) {
      case 1:
        context.fillStyle = 'green';
        break;
      case 2:
        context.fillStyle = 'red';
        break;
      default:
        context.fillStyle = 'gray';
        break;
    }
    context.beginPath();
    context.arc(player.x, player.y, 15, 0, 2 * Math.PI);
    context.fill();
  }



  context.fillStyle = 'black';
  for (const bullet in bullets) {
    context.beginPath();
    context.arc(bullets[bullet].currentX, bullets[bullet].currentY, 5, 0, 2 * Math.PI);
    context.fill();
  }
});

/**
*
* Calculate the current mouse Position
*
*/
(function() {
    var mousePos;

    document.onmousemove = handleMouseMove;
    setInterval(getMousePosition, 100); // setInterval repeats every X ms

    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        mousePos = {
            x: event.pageX,
            y: event.pageY,
        };
    }
    function getMousePosition() {
        var pos = mousePos;
        if (!pos) {
            // We haven't seen any movement yet
        }
        else {
            // Use pos.x and pos.y
            movement.clickX = pos.x;
            movement.clickY = pos.y;
        }
    }
})();