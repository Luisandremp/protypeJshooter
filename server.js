// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;


/************************************************************************
*        Server Set Up
*************************************************************************/
app.use('/', express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});
/************************************************************************
*        Starts the server
*************************************************************************/
server.listen(PORT, function(){
  console.log('listening on *:5000');
  console.log(__dirname+"/index.html")
});

/************************************************************************
*        On Connection get events from clients
*************************************************************************/
io.on('connection', function(socket) {
    socket.join('lobby');
    //socket.to('lobby')
    socket.emit('room', "lobby", io.sockets.adapter.rooms.lobby.length);


    
    //console.log(io.sockets.adapter.rooms.lobby);
    //console.log(io.sockets.adapter.rooms.game == null)
    //console.log(io.sockets.adapter.rooms.lobby.length)
    //console.log(Object.keys(io.sockets.adapter.rooms).length);
    //console.log(Array.from(Object.keys(socket.adapter.rooms)).length  );

/**
**
** Game server events
**
**/

  // on a new client connects create his "player"
  // Player id = to Socket Id  TO DO: Should change this to an UUID
  socket.on('new player', function() {
    console.log("new player")
    socket.leave('lobby');
    socket.join('game');
    socket.emit('room', "game");

    const newPlayer = JSON.parse(JSON.stringify(Player));
    newPlayer.id = socket.id;
    players[socket.id] = newPlayer;

    // Send world objects to the clients
    io.to('game').emit('world', controlPoints);

  });


  // on event Movement calculate the direction
  socket.on('movement', function(data) {
    const player = players[socket.id] || {};

    // check horizontal direction
    if (data.left) {
      player.dirX = -1;
    }else if (data.right) {
      player.dirX = 1;
    }else{
      player.dirX = 0;
    }

    // check vertical direction
    if (data.up) {
      player.dirY = -1;
    }else if (data.down) {
      player.dirY = 1;
    }else{
      player.dirY = 0;
    }

    //check mouse click
    if (data.click) {
     fireBullet(data.clickX,data.clickY, socket.id);
    }
  });

  // Change Players team
  socket.on('team', function(t) {
      players[socket.id].team = t;
      players[socket.id].healthPoints = 100;
  });

  // Event on client disconnect  Remove the player from the game
  socket.on('disconnect', (reason) => {
    if (players.hasOwnProperty(socket.id)) {
      delete players[socket.id];
    }
  });

});

/************************************************************************
*************************************************************************
*******************************GAME SERVER ******************************
*************************************************************************
*************************************************************************/

const Player = require('./entity/player.js');

const players = {};
const bullets = new Array();

const worldLimits = {
  top: 0,
  left: 0,
  right: 800,
  bottom: 600
}
const teamPoints = {
  "1": 0,
  "2": 0
};

/************************************************************************
*         Create World Static Objects
*************************************************************************/
const controlPoints = new Array();
   controlPoints.push({
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: worldLimits.left +100,
    y: worldLimits.top + 100
   },
   {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: worldLimits.right -50-100,
    y: worldLimits.top + 100
   },
     {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: worldLimits.right -50-100,
    y: worldLimits.bottom -50-100
   },
   {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: worldLimits.left +100,
    y: worldLimits.bottom -50-100
   });



/************************************************************************
*      Functions on repeat Timmer
*************************************************************************/
//update dynamic objects (player, bullets)
setInterval(function() {
  moveBullets();
  movePlayers();
  if(io.sockets.adapter.rooms.game != null){
    io.to("game").emit('state', players, bullets);
  }
}, 1000 / 30);
//update static objects (controlPoints)
setInterval(function() {
  checkPlayersInPoint();
  // Send world objects to the clients
  if(io.sockets.adapter.rooms.game != null){
    io.to("game").emit('world',controlPoints , teamPoints);
  };
  
}, 1000 / 2);




/************************************************************************
*         Create Bullets
*************************************************************************/
function fireBullet(x,y,id){
  if (players[id]) {
    //check if is not spectator
    if (players[id].team != 0) {
      //check if the player weapon is on cooldown
      if (players[id].weaponCoolDown+300 < Date.now()) {
        //last time fired, for CD calculations
        players[id].weaponCoolDown = Date.now();

        //get coords for bullet spawn
        bulletX = players[id]['x'] - x;
        bulletY = players[id]['y'] - y; 

        //create a normalised vector for the direction
        const long = Math.sqrt(bulletX*bulletX +bulletY*bulletY);
        const dirX = bulletX/long;
        const dirY = bulletY/long;

        //create the bullet object
        bullets.push({
            'owner': id,
            'radius': 5,
            'creation': Date.now(),
            'dirX': dirX,
            'dirY': dirY,
            'currentX': players[id]['x'],
            'currentY': players[id]['y'] 
          });
      }
    }
  }
}

/************************************************************************
*         Make Bullets Move
*************************************************************************/
function moveBullets(){
   for (bullet in bullets) {
    if (bullet != null) {
      //check how long the bullet has been alive, if still going add the vector direction else destroy it
      if (Date.now()-bullets[bullet].creation < 4000) {
        const destinationX = bullets[bullet].currentX - bullets[bullet].dirX*15;
        const destinationY = bullets[bullet].currentY - bullets[bullet].dirY*15;

      //check if the desired destination is available, and apply the new coords
      if (destinationX >= worldLimits.left && destinationX <= worldLimits.right ) {
        bullets[bullet].currentX = destinationX;
      }else{
        bullets.splice(bullet, 1);
              return;
      }
      if (destinationY >= worldLimits.top && destinationY <= worldLimits.bottom ) {
        bullets[bullet].currentY = destinationY; 
      }else{
        bullets.splice(bullet, 1);
              return;
      }

        //check collision with players (not shooter)
        for (player in players) {

          if (player != bullets[bullet].owner) {
            dx = players[player].x - bullets[bullet].currentX;
            dy = players[player].y - bullets[bullet].currentY;
            distance = Math.sqrt(dx * dx + dy * dy);

            if ( players[bullets[bullet].owner].team != players[player].team && players[bullets[bullet].owner].team != 0 && players[player].team  != 0 ){
              if (distance < players[player].radius + bullets[bullet].radius) {
              //Colision with other Players
              players[player].healthPoints -= 10;
              if (players[player].healthPoints <= 0) {
                players[player].team = 0;
                players[player].healthPoints =100;
              }

              bullets.splice(bullet, 1);
              return;
            }
            }
            
          }
        }

        // Check colision with world objects
        for (point in controlPoints) {
          x = bullets[bullet].currentX > controlPoints[point].x && bullets[bullet].currentX < controlPoints[point].x+controlPoints[point].width;
          y = bullets[bullet].currentY > controlPoints[point].y && bullets[bullet].currentY< controlPoints[point].y+controlPoints[point].height;
          if (x && y) {
            //Collision with World Object
            bullets.splice(bullet, 1);
            return;
          } 
        }
      }else{
        bullets.splice(bullet, 1);
      }
    }
  }
}


/************************************************************************
*         Make Players Move
*************************************************************************/
function movePlayers(){
   for (player in players) {
    if (player != null ) {
      // get coords x and y of the direction vector and the lenght of the direction vector
      const dirX = players[player].dirX;
      const dirY = players[player].dirY;
      const long = Math.sqrt(0+(dirX*dirX) + (dirY*dirY));
      

      //apply the direction vector to the player position to get the desired destination
      let destinationX = players[player].x + (players[player].dirX)*5;
      let destinationY = players[player].y + (players[player].dirY)*5;
      
      // normalize the vector if necessary
      if (long != 0) {
        destinationX = players[player].x + (players[player].dirX/long)*5;
        destinationY = players[player].y + (players[player].dirY/long)*5;
      }
        
      //  Verify that there are no world objects in X and Y coords
      isObj = false;
      for (point in controlPoints) {
        x = destinationX > controlPoints[point].x && destinationX < controlPoints[point].x+controlPoints[point].width;
        y = destinationY > controlPoints[point].y && destinationY< controlPoints[point].y+controlPoints[point].height;
        if (x && y) {
          isObj = true;
          break;
        }
      }
      
      //check colisions with other players.
      isPlayer = false;
      for (otherPlayer in players) {
          if (otherPlayer != player) {
            dx = players[otherPlayer].x - destinationX;
            dy = players[otherPlayer].y - destinationY;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < players[otherPlayer].radius + players[player].radius) {
              isPlayer = true;
              break;
            }
          }
        }
        //check if the desired destination is available, and apply the new coords
      if (destinationX >= worldLimits.left && destinationX <= worldLimits.right && !isObj && !isPlayer) {
        players[player].x = destinationX;
      }
      if (destinationY >= worldLimits.top && destinationY <= worldLimits.bottom && !isObj && !isPlayer) {
        players[player].y = destinationY; 
      }
    }
  }
}
/************************************************************************
*         Check if Player is in Control Point
*************************************************************************/
function checkPlayersInPoint(){
  for (point in controlPoints) {
    centerX = controlPoints[point].x+(controlPoints[point].width/2);
    centerY = controlPoints[point].y+(controlPoints[point].height/2);
    playerInArea1 =0;
    playerInArea2 =0;
    for(player in players){
      if (players[player].team != 0) {
        dx = players[player].x - centerX;
        dy = players[player].y - centerY;
        distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < players[player].radius + controlPoints[point].width/2 + 50) {
          if (players[player].team == 1) {
            playerInArea1++;
          }else if (players[player].team == 2) {
            playerInArea2++
          }
        }
      }
    }

    if (playerInArea1>playerInArea2) {
      if (controlPoints[point].points == 0){
        controlPoints[point].team = 1;
        controlPoints[point].points = 1;
      }else if (controlPoints[point].team == 1 && controlPoints[point].points < 10) {
        controlPoints[point].points += 1;
      }else if (controlPoints[point].team == 2 && controlPoints[point].points > 0) {
        controlPoints[point].points -= 1;
      }    
    }else if (playerInArea2>playerInArea1) {;
      if (controlPoints[point].points == 0){
        controlPoints[point].team = 2;
        controlPoints[point].points = 1;
      }else if (controlPoints[point].team == 2 && controlPoints[point].points < 10) {
        controlPoints[point].points += 1;
      }else if (controlPoints[point].team == 1 && controlPoints[point].points > 0) {
        controlPoints[point].points -= 1;
      } 
    }
   
    if (controlPoints[point].points == 0) {
      controlPoints[point].team = 0;
    }else if (controlPoints[point].team == 1) {
      teamPoints["1"] += 1;
    }else if (controlPoints[point].team == 2) {
      teamPoints["2"] += 1;
    }
    
  }
  
}




