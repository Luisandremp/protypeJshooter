
const socket = io();
const objectList = new Array();

//initialize the movement object
const movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    click: false,
    clickX: 0,
    clickY: 0
};

let players = {};
let bullets = {};

let worldObjects = new Array();
let teamPoints ={
  "1": 0,
  "2": 0
};


const canvas = document.getElementById('canvas');
const menu = document.getElementById('menu');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');
context.mouse = {
      x: 0,
      y: 0,
      clicked: false,
      down: false
  };

/**
* Mouse Events
**/
canvas.addEventListener("mousemove", function(e) {
      context.mouse.x = e.offsetX;
      context.mouse.y = e.offsetY;
      movement.clickX = context.mouse.x;
      movement.clickY = context.mouse.y;
});

canvas.addEventListener("mousedown", function(e) {
    context.mouse.clicked = !context.mouse.down;
    context.mouse.down = true;
    movement.click = context.mouse.clicked;
});

canvas.addEventListener("mouseup", function(e) {
    context.mouse.down = false;
    context.mouse.clicked = false;
    movement.click = context.mouse.clicked;
});
//Keyboard Events
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

// listen for what room we are on
socket.on('room', function (r) {
  enterRoom(r);
});
socket.on("refreshLobby", function(nbPlayers, players){
  $("#nb").load("index.html #nb", function(){
    $("#nb").html(nbPlayers)
  });
  let listP1 = "";
  let listP2 = "";
  for (p in players){
    if (players[p].team == 1) {
      listP1 += "<li>"+players[p].name+"</li>";
    }
    else if (players[p].team == 2) {
      listP2 += "<li>"+players[p].name+"</li>";
    }
    
  }
  $("#team1list").load("index.html #team1list", function(){
    $("#team1list").html(listP1);
  });
  $("#team2list").load("index.html #team2list", function(){
    $("#team2list").html(listP2);
  });


});
function enterRoom(room){
  /**
  //If we are on Lobby
  **/
  if (room == "lobby") {
    console.log('im on lobby');
    menu.style["display"] = "block";
    canvas.style["display"] = "none";
     //clear frame
     $("#btnStart").click(function(event){
      console.log("Start");
      socket.emit('joinGame');
     });
    $("#btnTeam1").click(function(event){
      socket.emit('team', 1 , $("#nickname").val());
    });
    
    $("#btnTeam2").click(function(event){
      socket.emit('team', 2, $("#nickname").val());
    });  

  //example de creation de object 
  //objectList.push(new button("button 2", 100 , 200 , 100, 40));
   
  /**
  //else = We are in a Game
  **/
  }else{
    console.log('im on Game');
    menu.style["display"] = "none";
    canvas.style["display"] = "block";
    /**
    *  Recursive Function to send client information
    **/
    setInterval(function() {
      socket.emit('movement', movement);
    }, 1000 / 30);

    /**
    * - Listen for world Objects update
    **/
    socket.on('world', function (objs , tp) {
      worldObjects = objs;
      teamPoints = (tp === undefined) ? teamPoints : tp;
    });
    /**
    * - Listen for dynamic objects update
    **/
    socket.on('state', function(p, b) {
      players = p;
      bullets = b;
    });
  }
}
/**
*  Recursive Function to Draw Objects
**/
setInterval(function() {
// TEst draw button class
context.clearRect(0, 0, 800, 600);
  for (i in objectList){
    objectList[i].updateState(context);
    objectList[i].draw(context);
  }
  /**
  * - Draw Game
  **/

  // draw Text with team points
  context.font = '25px serif';
  context.fillText('team 1: '+teamPoints["1"]+' team 2: '+teamPoints["2"], 300, 28);

  // draw control points for each control point check it is controled by a team and change its color then draw it
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
      //  draw progress bar for control points
      context.fillRect(worldObjects[obj].x , worldObjects[obj].y-10, (worldObjects[obj].width/10)*(worldObjects[obj].points), 5);
      context.fill();
    }

    // Draw each player with the apropriate team color
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
      // draw health bar over the player
      context.fillRect(player.x-15 , player.y-25, (30/100)*(player.healthPoints), 5);
      context.fill();
    }

    //Draw Bullets
    context.fillStyle = 'black';
    for (const bullet in bullets) {
      context.beginPath();
      context.arc(bullets[bullet].currentX, bullets[bullet].currentY, 5, 0, 2 * Math.PI);
      context.fill();
    }

},  1000 / 30);
