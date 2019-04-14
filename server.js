// Dependencies
const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const axios = require('axios');
const PORT = process.env.PORT || 3000;
const Player = require('./entity/player.js');
const Game = require('./entity/game.js');
const gameList = new Array();
const playersList = {};
const SERVERWEB = "http://192.168.20.102:5000";
//const SERVERWEB = "http://192.168.43.154:5000";


/************************************************************************
*        Server Set Up
*************************************************************************/
app.use('/', express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});/*
/************************************************************************
*        Starts the server
*************************************************************************/
server.listen(PORT, function(){
  console.log(__dirname+"/index.html:"+PORT);
});

//Functions to send game info to the clients 
exports.updateDynamicObjects = function (players, bullets, minions){
    if(io.sockets.adapter.rooms.game != null){
      io.to("game").emit('state', players, bullets, minions);
     }
}
exports.updateWorldObjects = function (controlPoints, minionFactories, teamPoints, healthPacks, bosses, SpawnArea){
  if(io.sockets.adapter.rooms.game != null){
    io.to("game").emit('world',controlPoints , minionFactories, teamPoints, healthPacks, bosses, SpawnArea);
  };
}
//Functions to tell clients a tower is attacking
exports.towerAttack = function (tower){
  if(io.sockets.adapter.rooms.game != null){
    io.to("game").emit('towerAttack', tower);
   }
}
// function to finish and destroy a game
exports.GameOver = function(){
  io.to("game").emit('gameOver');
  if(io.sockets.adapter.rooms.game != null){
    for(socket in io.sockets.adapter.rooms.game.sockets){
      if (io.sockets.connected[socket] == null) { break;}// if there are no more sockets connected Exit loop

      playersList[socket] = JSON.parse(JSON.stringify(Player)); // reset player to the model
      playersList[socket].id = socket; // give him back his id
      
      io.sockets.connected[socket].leave('game');// leave the lobby
      io.sockets.connected[socket].join('lobby');// join the room Game
      
      io.sockets.connected[socket].emit('room', "lobby"); //tell client he is currently in lobby
      
      delete gameList[0].players[socket];
      io.sockets.connected[socket].disconnect();
      
    }
  }
   gameList[0] = null;
   refreshLobby();
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
    newPlayer.ready = false;
    playersList[socket.id] = newPlayer;   // add the player to the current list

     //variable to see to what team this player should be added
     let teamOne = 0;
     let teamTwo = 0;
 
     //check all players to see if this user is already a player kill old socket keep new one
     for (const key in playersList) {
       if (playersList.hasOwnProperty(key)) {
         const player = playersList[key];
     // count how many players in each team
         if (player.team == 1) {
           teamOne ++;  
         } else if(player.team == 2) {
           teamTwo ++;
         }
       }
     }
 
     if (teamOne <= teamTwo) {
       playersList[socket.id].team = 1; 
     } else {
       playersList[socket.id].team = 2; 
     }

  }else{
    console.log("Player with this socket already exists"); //alert me that somthings wrong and the player already exists
  }
  //get user id from the client to sync with the database
  socket.on("userID", function(userId, name){
   
    //check all players to see if this user is already a player kill old socket keep new one
    for (const key in playersList) {
      if (playersList.hasOwnProperty(key)) {
        const player = playersList[key];

        // delete old socket of this client
        if (player.userId != null && player.id != socket.id && player.userId  == userId) {
          io.sockets.connected[player.id].disconnect(); 
        }
      }
    }
    playersList[socket.id].userId = userId;
    playersList[socket.id].name = name;
    refreshLobby();
  })

  refreshLobby(); // updates the info of the lobby on all clients (because there is a new player)
  
  //socket.to('lobby')
  //console.log(io.sockets.adapter.rooms.lobby);
  //console.log(io.sockets.adapter.rooms.game == null)
  //console.log(io.sockets.adapter.rooms.lobby.length)
  //console.log(Object.keys(io.sockets.adapter.rooms).length);
  //console.log(Array.from(Object.keys(socket.adapter.rooms)).length  );

  //player changes team 
  socket.on("team", function(nb, name){
    playersList[socket.id].team = nb; 
    console.log (name);
    if (name) {
      playersList[socket.id].name = name;  
    }
    refreshLobby(); //refresh lobby because a player has a new team
  });
  //player is ready to start game
  socket.on("ready", function(){
    playersList[socket.id].ready = true;
    
    let allReady = false;
    for (const key in playersList) {
      if (playersList.hasOwnProperty(key)) {
        const player = playersList[key];
        
        if (!player.ready) {
          allReady = false;
          break;
        }
        allReady=true;
      }
    }

    if(allReady){
      io.to('lobby').emit('startGame');
    }
    refreshLobby(); //refresh lobby because ready status changed
  });
  //player is ready to start game
  socket.on("unready", function(){
    playersList[socket.id].ready = false;     
    refreshLobby(); //refresh lobby because ready status changed
  });

  socket.on("enterGame", function(){  
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
        // add spawn point
        const player = gameList[0].players[socket.id];
        if (player.team == 1) {
          player.x = gameList[0].worldLimits.left+50
          player.y = gameList[0].worldLimits.bottom-50
        } else if (player.team  == 2)  {
          player.x = gameList[0].worldLimits.right-50
          player.y = gameList[0].worldLimits.top+50
        }
        gameList[0].RoutingServer.sendAllGameInfo(false);  
    }

    socket.leave('lobby');// leave the lobby
    socket.join('game');// join the room Game

     // add this player to the list Active players
    socket.emit('room', "game"); // tell this client he his in game room

  });


  socket.on('forceDisconnect', function() {
    io.sockets.connected[socket.id].disconnect();
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
  socket.on('disconnect', () => {
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
  });

  socket.on('power',function (interfaceInput) {  
    gameList[0].activatePower(socket.id, interfaceInput.clickX, interfaceInput.clickY);
  });

  socket.on('choosePower',function (power) { 
   gameList[0].choosePower(socket.id, power);
 })
});

//Sends info to refresh the Lobby Room
function refreshLobby(){
  if (io.sockets.adapter.rooms.lobby != null) {
    io.to('lobby').emit('refreshLobby', playersList);
  }
};

exports.sendAllGameInfo = function(endgame) {
  if (gameList[0] != null) {
    let gameObject={}; // object to send to the server
    const players = []; // player list to add to the statistics
    let  newPlayerInfo = {}; // temporary object to create players to the list
    const playerList = gameList[0].players;


    if (gameList[0].statistics == null) { // if first time in this game create it;
      //start the game object
      gameObject.game = {
        "winningTeam": 0,
        "timeElapsed": 0,
        "dateOfTheGame": Date.now()
      }

      axios.post(SERVERWEB+'/statistics/newGameStatistics', gameObject)
      .then(function (response) {
        gameObject.game.id = response.data[0].gameId;
        initPlayers();
      })
      .catch(function (error) {
        console.log(error);
      });
      
      function initPlayers(){
        //create the list of player all initialized
        for (const key in playerList) {
          if (playerList.hasOwnProperty(key)) {
            const player = playerList[key];
            player.timeStartPlaying = Date.now();// to have a baseline to count the time played
            player.powerHistory = {   // to have a baseline to count time played has character
              timeSinceLastTest:  Date.now(),
              power: player.power
            }          

            newPlayerInfo= {};
            newPlayerInfo.team = player.team;
            newPlayerInfo.playersKilled = 0;
            newPlayerInfo.deaths = 0
            newPlayerInfo.minionsKilled = 0;
            newPlayerInfo.towerContribution = 0;
            newPlayerInfo.timePlayed = 0;
            newPlayerInfo.power1 = 0;
            newPlayerInfo.power2 = 0
            newPlayerInfo.power3 = 0;
            newPlayerInfo.quitBeforeEndGame = !endgame;
            newPlayerInfo.fkPlayers = player.userId;
            newPlayerInfo.fkMatches = gameObject.game.id;
            newPlayerInfo.socket = key;

            player.statistics = newPlayerInfo;
            players.push(newPlayerInfo);
          }
        }
      }
      
      gameObject.players = players;
      gameList[0].statistics = gameObject;


    } else {

      //mise a jour du match
      gameObject = gameList[0].statistics;
      gameObject.game.timeElapsed = ( Date.now() - gameObject.game.dateOfTheGame);
      if(gameList[0].teamPoints[1]>gameList[0].teamPoints[2]){
        gameObject.game.winningTeam = 1;
      }else if(gameList[0].teamPoints[1]<gameList[0].teamPoints[2]){
        gameObject.game.winningTeam = 2;
      }else{
        gameObject.game.winningTeam = 0;
      }

      //mise a jour des avatars
      for (const key in playerList) {
        if (playerList.hasOwnProperty(key)) {
          
          const player = playerList[key];
          let exists = false;
          for (let index = 0; index < gameObject.players.length; index++) {
            const playerCreated = gameObject.players[index];
          if (playerCreated.socket == key) { exists=true;}
          };
          if (exists) {
            newPlayerInfo= {};
            newPlayerInfo.team =player.statistics.team;
            newPlayerInfo.playersKilled = player.statistics.playersKilled;
            newPlayerInfo.deaths = player.statistics.deaths;
            newPlayerInfo.minionsKilled = player.statistics.minionsKilled;
            newPlayerInfo.towerContribution = player.statistics.towerContribution;
            newPlayerInfo.timePlayed = (Date.now() - player.timeStartPlaying);
            newPlayerInfo.power1 = calculateTimeAsPower(1, player);
            newPlayerInfo.power2 = calculateTimeAsPower(2, player);
            newPlayerInfo.power3 = calculateTimeAsPower(3, player);
            

            newPlayerInfo.quitBeforeEndGame = !endgame;
            newPlayerInfo.socket = key;
            newPlayerInfo.fkPlayers = player.userId;
            newPlayerInfo.fkMatches = gameObject.game.id;
             
          }else{
            player.timeStartPlaying = Date.now();// to have a baseline to count the time played
            player.powerHistory = {
              timeSinceLastTest:  Date.now(),
            }
            


            newPlayerInfo= {};
            newPlayerInfo.team = player.team;
            newPlayerInfo.playersKilled = 0;
            newPlayerInfo.deaths = 0
            newPlayerInfo.minionsKilled = 0;
            newPlayerInfo.towerContribution = 0;
            newPlayerInfo.timePlayed = 0;
            newPlayerInfo.power1 = 0;
            newPlayerInfo.power2 = 0
            newPlayerInfo.power3 = 0;
            newPlayerInfo.quitBeforeEndGame = !endgame;
            newPlayerInfo.fkPlayers = player.userId;
            newPlayerInfo.socket = key;

          }
        }
      gameList[0].players[key].statistics = newPlayerInfo;
      players.push(newPlayerInfo);
      }
      gameObject.players = players;
      gameList[0].statistics = gameObject;

      axios.post(SERVERWEB+'/statistics/updateGameStatistics', gameObject)
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }
}

calculateTimeAsPower = function (power, player){
    if (player.powerHistory.power == power ) {
      player.statistics['power'+power] += Date.now() -player.powerHistory.timeSinceLastTest;
      player.powerHistory.timeSinceLastTest =Date.now();
    }
    const time = player.statistics['power'+power];
    if(player.power != player.powerHistory.power){
      player.powerHistory.power = player.power;
    }
    return  time;        
}
