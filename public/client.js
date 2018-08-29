class Camera{
  constructor(xOffset,yOffset,){
      this.xOffset = xOffset;
      this.yOffset = yOffset;
  }
  centerOnObject(centerOfCamera){
    if(centerOfCamera.x-canvas.width/2 > 0 && centerOfCamera.x+canvas.width/2 < 1500){
      this.xOffset = centerOfCamera.x-canvas.width/2;
    }else if(centerOfCamera.x-canvas.width/2 <= 0){
      this.xOffset = 0;
    }    else if(centerOfCamera.x+canvas.width/2 >= 1500){
      this.xOffset = 1500-canvas.width;
    }
    if(centerOfCamera.y-canvas.height/2 > 0 && centerOfCamera.y+canvas.height/2 < 1500){
      this.yOffset = centerOfCamera.y-canvas.height/2;
    } else if(centerOfCamera.y-canvas.height/2 <= 0){
      this.yOffset = 0;
    }else if(centerOfCamera.y+canvas.height/2 >= 1500){
      this.yOffset = 1500-canvas.height;
    }      
  }
}
const socket = io();
//const objectList = new Array();

//instantitate camera
const camera = new Camera(0,0);

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
let minions = {};
let bosses = {};
let myCharacter = {};

let controlPoints = new Array();
let teamPoints ={
  "1": 0,
  "2": 0
};
let healthPacks= new Array();



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
      movement.clickX = context.mouse.x+camera.xOffset;
      movement.clickY = context.mouse.y+camera.yOffset;
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
      case 32: // space
      socket.emit('power', movement);
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
    menu.style["display"] = "block";
    canvas.style["display"] = "none";
     //clear frame
     $("#btnStart").click(function(event){
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
    socket.on('world', function (objs , tp, hp, b) {
      controlPoints = objs;
      teamPoints = (tp === undefined) ? teamPoints : tp;
      healthPacks = hp;
      bosses = b;
    });
    /**
    * - Listen for dynamic objects update
    **/
    socket.on('state', function(p, b, m) {
      players = p;
      bullets = b;
      minions = m;

      for(id in players) {
        if(id == socket.id){
          myCharacter = players[id];
        }
        
      }
    });


function drawBackground(){
  const img = new Image();
  img.src = "./imgs/hex.png";
  imgSize = 400;
  worldSize = 1500;
  iteration = Math.ceil(worldSize/imgSize);
  for (let indexX = 0; indexX < iteration; indexX++) {
    for (let indexY = 0; indexY < iteration; indexY++) {
      context.drawImage(img, (imgSize*indexX)-camera.xOffset, (imgSize*indexY)-camera.yOffset);
    } 
  }
}
  /**
  *  Recursive Function to Draw Objects
  **/
  setInterval(function() { 
    /*
    // TEst draw button class
      for (i in objectList){
        objectList[i].updateState(context);
        objectList[i].draw(context);
      }
    */

   camera.centerOnObject(myCharacter);

    /**
    * - Draw Game
    **/
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

     
    
 
    // draw Text with team points
    chooseColor(1);
    context.fillRect(10, 10, (((canvas.width/2)-10)/500)*(teamPoints["1"]), 10);
    context.save();
    chooseColor(2);
    context.translate(canvas.width,0);
    context.rotate((Math.PI/180)*180);  
    context.fillRect(10, -20, (((canvas.width/2)-10)/500)*(teamPoints["2"]), 10);
    context.restore();

    context.fillStyle = 'black';
    context.font = '10px sans-serif';
    context.fillText(teamPoints["1"], 10, 30);
    context.fillText(teamPoints["2"], canvas.width-30, 30);

    // draw control points for each control point check it is controled by a team and change its color then draw it
    for (const key in controlPoints) {
     controlPoint = controlPoints[key];
     chooseColor(controlPoint.team);
      context.fillRect(controlPoint.x-camera.xOffset, controlPoint.y-camera.yOffset, controlPoint.width, controlPoint.height);
      //  draw progress bar for control points
      chooseColor(controlPoint.conqueringTeam);
      context.fillRect(controlPoint.x-camera.xOffset , controlPoint.y-10-camera.yOffset, (controlPoint.width/10)*(controlPoint.points), 5);
    }
  
      // Draw each player with the apropriate team color
      drawCircles(players, true)
      //Draw Bullets
      drawCircles(bullets, false)
      //Draw Minions
      drawCircles(minions, false)
      //Draw Bosses
      drawCircles(bosses, false);
      drawCircleStroke(bosses);
      drawPointsCircleStroke(controlPoints);
    
      
      //Draw healthPacks
      for (keyHP in healthPacks) {
        pack = healthPacks[keyHP];
          
        switch (pack.team) {
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
        context.fillRect(pack.currentX-camera.xOffset , (pack.currentY-camera.yOffset)+(pack.radius/4), pack.radius, pack.radius/2);
        context.fillRect((pack.currentX-camera.xOffset)+(pack.radius/4), pack.currentY-camera.yOffset, pack.radius/2, pack.radius);
      }
    },  1000 / 60);
  }
  function drawCircleStroke(list, isplayer){
    for (const key in list) {
      item = list[key];
      chooseColor(item.team);
      
      context.beginPath();
      const x = item.x-camera.xOffset;
      const y = item.y-camera.yOffset;
           
      context.arc(x, y, item.area+5, 0, 2 * Math.PI);
      context.stroke();
    }
  }
  function drawPointsCircleStroke(list, isplayer){
    for (const key in list) {
      item = list[key];
      chooseColor(item.team);
      
      context.beginPath();
      const x = item.x-camera.xOffset+item.width/2;
      const y = item.y-camera.yOffset+item.height/2;
           
      context.arc(x, y, item.area+5, 0, 2 * Math.PI);
      context.stroke();
    }
  }
  function drawCircles(list, isplayer){
    for (const key in list) {
      item = list[key];
      chooseColor(item.team);
      
      context.beginPath();
      context.arc(item.x-camera.xOffset, item.y-camera.yOffset, item.radius, 0, 2 * Math.PI);
      context.fill();

      if (isplayer) {
        // draw health bar over the player
        context.fillRect(item.x-item.radius-camera.xOffset , item.y-item.radius-10-camera.yOffset, ((item.radius*2)/100)*(item.healthPoints), 5);
      }
    }
  }
  function chooseColor(team){
    switch (team) {
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
}
