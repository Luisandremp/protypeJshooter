// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;
const Player = require('./entity/player.js');
const Bullet = require('./entity/bullet.js');
const Game = require('./entity/game.js');
const gameList = new Array();
const playersList = {};

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
  console.log(__dirname+"/index.html:5000");
});

//Functions to send game info to the clients 
exports.updateDynamicObjects = function (players, bullets){
    if(io.sockets.adapter.rooms.game != null){
      io.to("game").emit('state', players, bullets);
     }
}
exports.updateWorldObjects = function (controlPoints, teamPoints){
  if(io.sockets.adapter.rooms.game != null){
    io.to("game").emit('world',controlPoints , teamPoints);
  };
}
// function to finish and destroy a game
exports.GameOver = function(){
  if(io.sockets.adapter.rooms.game != null){
    for(socket in io.sockets.adapter.rooms.game.sockets){
      if (io.sockets.connected[socket] == null) { break;}
      io.sockets.connected[socket].leave('game');// leave the lobby
      io.sockets.connected[socket].join('lobby');// join the room Game
      io.sockets.connected[socket].emit('room', "lobby");
      delete playersList[socket];
      const newPlayer = JSON.parse(JSON.stringify(Player));
      newPlayer.id = socket;
      playersList[socket] = newPlayer;
    }
  }
   gameList[0]=null;
}

/************************************************************************
*        On Connection get events from clients
*************************************************************************/
io.on('connection', function(socket) {
  socket.join('lobby');// this client joins room lobby
  socket.emit('room', "lobby"); // tell this client he is on lobby
  
  if (playersList[socket.id] == null) { //check if the player is aready in the list of connected players
    const newPlayer = JSON.parse(JSON.stringify(Player)); //create a new player from my Model
    newPlayer.id = socket.id; // give the new player an id socket
    playersList[socket.id] = newPlayer;   // add the player to the current list
  }else{
    console.log("Player with this socket already exists"); //alert me that somthings wrong and the player already exists
  }
  refreshLobby(); // updates the info of the lobby on all clients (because there is a new player)
  
  //socket.to('lobby')
  //console.log(io.sockets.adapter.rooms.lobby);
  //console.log(io.sockets.adapter.rooms.game == null)
  //console.log(io.sockets.adapter.rooms.lobby.length)
  //console.log(Object.keys(io.sockets.adapter.rooms).length);
  //console.log(Array.from(Object.keys(socket.adapter.rooms)).length  );

  //player changes team and applys name
  socket.on("team", function(nb, name){
    playersList[socket.id].team = nb;     
    playersList[socket.id].name = name;
    refreshLobby(); //refresh lobby because a player has a new name and team
  });

  // Player id = to Socket Id  TO DO: Should change this to an UUID
  socket.on('joinGame', function() {
    // if there are no available games
    if (gameList[0] == null) {
      // create an instance of a Game
      const game = Object.create(Game);
      //add it to the game instance list
      gameList[0]=(game);
      //add the player said game
      gameList[0].players[socket.id] = playersList[socket.id];
      //start the game
      gameList[0].start();
    }else{
      //if there is an available game add the player to that game
      gameList[0].players[socket.id] = playersList[socket.id];
    }


    socket.leave('lobby');// leave the lobby
    socket.join('game');// join the room Game

     // add this player to the list Active players
    socket.emit('room', "game"); // tell this client he his in game room

    refreshLobby();
  });

  // on event Movement calculate the direction
  socket.on('movement', function(data) {
    if (gameList[0] != null && gameList[0].players[socket.id] != null) {
      // check horizontal direction
      if (data.left) {
        gameList[0].players[socket.id].dirX = -1;
      }else if (data.right) {
        gameList[0].players[socket.id].dirX = 1;
      }else{
        gameList[0].players[socket.id].dirX = 0;
      }

      // check vertical direction
      if (data.up) {
        gameList[0].players[socket.id].dirY = -1;
      }else if (data.down) {
        gameList[0].players[socket.id].dirY = 1;
      }else{
        gameList[0].players[socket.id].dirY = 0;
      }

      //check mouse click
      if (data.click) {
       gameList[0].fireBullet(data.clickX,data.clickY, socket.id);
      }
    }
  });
  
  // Event on client disconnect  Remove the player from the game
  socket.on('disconnect', (reason) => {
    if (playersList.hasOwnProperty(socket.id)) {
      delete playersList[socket.id];
      if (gameList[0] != null && gameList[0].players[socket.id] != null) {
        delete gameList[0].players[socket.id];
      }
    }
    if(gameList[0] != null){
      if( Object.keys(gameList[0].players).length <= 0 ){
        gameList[0].gameOver();
      }
    }
    
    refreshLobby();
  });
  // Change Players team
  socket.on('team', function(t) {
    playersList[socket.id].team = t;
    playersList[socket.id].healthPoints = 100;
  });

});

//Sends info to refresh the Lobby Room
function refreshLobby(){
  if (io.sockets.adapter.rooms.lobby != null) {
    io.to('lobby').emit('refreshLobby', io.sockets.adapter.rooms.lobby.length, playersList);
  }
};





