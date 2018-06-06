module.exports ={
  Player: require('./player.js'),
  Bullet: require('./bullet.js'),
  RoutingServer: require('../server.js'),
  players: {},
  bullets: [],
  MAXTEAMPOINTS:150,
  worldLimits: {
      top: 0,
      left: 0,
      right: 800,
      bottom: 600
    },
  teamPoints:{
      "1": 0,
      "2": 0
    },
    updateDynamic: "",
    updateWorld: "",
    /************************************************************************
    *         Create World Static Objects
    *************************************************************************/
  controlPoints: new Array(),
  populateControlPoints: function(){
    this.controlPoints= new Array();
    this.controlPoints.push(
      {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: this.worldLimits.left +100,
    y: this.worldLimits.top + 100
   },
   {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: this.worldLimits.right -50-100,
    y: this.worldLimits.top + 100
   },
     {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: this.worldLimits.right -50-100,
    y: this.worldLimits.bottom -50-100
   },
   {
    team: 0,
    points: 0,
    width: 50,
    height: 50,
    x: this.worldLimits.left +100,
    y: this.worldLimits.bottom -50-100
   });
  },
  /************************************************************************
  *      Functions on repeat Timmer
  *************************************************************************/
  start: function(){
    console.log("=========================");
    console.log("server start");
    console.log(this.players);
    console.log("=========================");
    thisGame  = this;
    this.populateControlPoints();
    this.teamPoints[1]= this.MAXTEAMPOINTS;
    this.teamPoints[2]= this.MAXTEAMPOINTS;
     //update dynamic objects (player, bullets)
    this.updateDynamic = setInterval(function() {
      thisGame.moveBullets();
      thisGame.movePlayers();
      thisGame.RoutingServer.updateDynamicObjects(thisGame.players, thisGame.bullets);
    }, 1000 / 30);
    //update static objects (controlPoints)
    this.updateWorld = setInterval(function() {

      thisGame.checkPlayersInPoint();
      thisGame.teamPoints[1] -= 1;
      thisGame.teamPoints[2] -= 1;

      // Send world objects to the clients
      thisGame.RoutingServer.updateWorldObjects(thisGame.controlPoints , thisGame.teamPoints);
      if (thisGame.teamPoints["1"]  <= 0 || thisGame.teamPoints["2"] <= 0 ) {
        thisGame.gameOver();
      }
    }, 1000 / 2);
  },
   
  /************************************************************************
  *         Create Bullets
  *************************************************************************/
  fireBullet: function (x,y,id){
    if (this.players[id]) {
      //check if is not spectator
      if (this.players[id].team != 0) {
        //check if the player weapon is on cooldown
        if (this.players[id].weaponCoolDown+300 < Date.now()) {
          //last time fired, for CD calculations
          this.players[id].weaponCoolDown = Date.now();

          //get coords for bullet spawn
          bulletX = this.players[id]['x'] - x;
          bulletY = this.players[id]['y'] - y; 

          //create a normalised vector for the direction
          const long = Math.sqrt(bulletX*bulletX +bulletY*bulletY);
          const dirX = bulletX/long;
          const dirY = bulletY/long;


          //create the bullet object
          const newbullet = JSON.parse(JSON.stringify(this.Bullet));
           newbullet.owner = id;
           newbullet.dirX = dirX;
           newbullet.dirY = dirY;
           newbullet.creation= Date.now(),
           newbullet.currentX = this.players[id]['x'];
           newbullet.currentY = this.players[id]['y'];


          this.bullets.push(newbullet);
        }
      }
    }
  },

  /************************************************************************
  *         Make Bullets Move
  *************************************************************************/
  moveBullets: function(){
     for (bullet in this.bullets) {

      if (bullet != null) {
        //check how long the bullet has been alive, if still going add the vector direction else destroy it
        if (Date.now()-this.bullets[bullet].creation < 4000) {
          const destinationX = this.bullets[bullet].currentX - this.bullets[bullet].dirX*15;
          const destinationY = this.bullets[bullet].currentY - this.bullets[bullet].dirY*15;

          //check if the desired destination is available, and apply the new coords
          if (destinationX >= this.worldLimits.left && destinationX <= this.worldLimits.right ) {
            this.bullets[bullet].currentX = destinationX;
          }else{
            this.bullets.splice(bullet, 1);
                  return;
          }
          if (destinationY >= this.worldLimits.top && destinationY <= this.worldLimits.bottom ) {
            this.bullets[bullet].currentY = destinationY; 
          }else{
            this.bullets.splice(bullet, 1);
                  return;
          }

          //check collision with players (not shooter)
          for (player in this.players) {

            if (player != this.bullets[bullet].owner) {
              dx = this.players[player].x - this.bullets[bullet].currentX;
              dy = this.players[player].y - this.bullets[bullet].currentY;
              distance = Math.sqrt(dx * dx + dy * dy);

              if ( this.players[this.bullets[bullet].owner].team != this.players[player].team && this.players[this.bullets[bullet].owner].team != 0 && this.players[player].team  != 0 ){
                if (distance < this.players[player].radius + this.bullets[bullet].radius) {
                //Colision with other Players
                this.players[player].healthPoints -= 10;
                if (this.players[player].healthPoints <= 0) {
                  this.players[player].team = 0;
                  this.players[player].healthPoints =100;
                }

                this.bullets.splice(bullet, 1);
                return;
              }
              }
              
            }
          }

          // Check colision with world objects
          for (point in this.controlPoints) {
            x = this.bullets[bullet].currentX > this.controlPoints[point].x && this.bullets[bullet].currentX < this.controlPoints[point].x+this.controlPoints[point].width;
            y = this.bullets[bullet].currentY > this.controlPoints[point].y && this.bullets[bullet].currentY< this.controlPoints[point].y+this.controlPoints[point].height;
            if (x && y) {
              //Collision with World Object
              this.bullets.splice(bullet, 1);
              return;
            } 
          }
        }else{
          this.bullets.splice(bullet, 1);
        }
      }
    }
  },
  /************************************************************************
  *         Make Players Move
  *************************************************************************/
  movePlayers: function(){
     for (player in this.players) {
      if (player != null ) {
        // get coords x and y of the direction vector and the lenght of the direction vector
        const dirX = this.players[player].dirX;
        const dirY = this.players[player].dirY;
        const long = Math.sqrt(0+(dirX*dirX) + (dirY*dirY));
        

        //apply the direction vector to the player position to get the desired destination
        let destinationX = this.players[player].x + (this.players[player].dirX)*5;
        let destinationY = this.players[player].y + (this.players[player].dirY)*5;
        
        // normalize the vector if necessary
        if (long != 0) {
          destinationX = this.players[player].x + (this.players[player].dirX/long)*5;
          destinationY = this.players[player].y + (this.players[player].dirY/long)*5;
        }
          
        //  Verify that there are no world objects in X and Y coords
        isObj = false;
        for (point in this.controlPoints) {
          x = destinationX > this.controlPoints[point].x && destinationX < this.controlPoints[point].x+this.controlPoints[point].width;
          y = destinationY > this.controlPoints[point].y && destinationY< this.controlPoints[point].y+this.controlPoints[point].height;
          if (x && y) {
            isObj = true;
            break;
          }
        }
        
        //check colisions with other players.
        isPlayer = false;
        /*
        for (otherPlayer in this.players) {
            if (otherPlayer != player) {
              dx = this.players[otherPlayer].x - destinationX;
              dy = this.players[otherPlayer].y - destinationY;
              distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < this.players[otherPlayer].radius + this.players[player].radius) {
                isPlayer = true;
                break;
              }
            }
          }
          */
          //check if the desired destination is available, and apply the new coords
        if (destinationX >= this.worldLimits.left && destinationX <= this.worldLimits.right && !isObj && !isPlayer) {
          this.players[player].x = destinationX;
        }
        if (destinationY >= this.worldLimits.top && destinationY <= this.worldLimits.bottom && !isObj && !isPlayer) {
          this.players[player].y = destinationY; 
        }

      }
    }
  },
  /************************************************************************
  *         Check if Player is in Control Point
  *************************************************************************/
  checkPlayersInPoint: function(){
    for (point in this.controlPoints) {
      centerX = this.controlPoints[point].x+(this.controlPoints[point].width/2);
      centerY = this.controlPoints[point].y+(this.controlPoints[point].height/2);
      playerInArea1 =0;
      playerInArea2 =0;
      for(player in this.players){
        if (this.players[player].team != 0) {
          dx = this.players[player].x - centerX;
          dy = this.players[player].y - centerY;
          distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.players[player].radius + this.controlPoints[point].width/2 + 50) {
            if (this.players[player].team == 1) {
              playerInArea1++;
            }else if (this.players[player].team == 2) {
              playerInArea2++
            }
          }
        }
      }

      if (playerInArea1>playerInArea2) {
        if (this.controlPoints[point].points == 0){
          this.controlPoints[point].team = 1;
          this.controlPoints[point].points = 1;
        }else if (this.controlPoints[point].team == 1 && this.controlPoints[point].points < 10) {
          this.controlPoints[point].points += 1;
        }else if (this.controlPoints[point].team == 2 && this.controlPoints[point].points > 0) {
          this.controlPoints[point].points -= 1;
        }    
      }else if (playerInArea2>playerInArea1) {;
        if (this.controlPoints[point].points == 0){
          this.controlPoints[point].team = 2;
          this.controlPoints[point].points = 1;
        }else if (this.controlPoints[point].team == 2 && this.controlPoints[point].points < 10) {
          this.controlPoints[point].points += 1;
        }else if (this.controlPoints[point].team == 1 && this.controlPoints[point].points > 0) {
          this.controlPoints[point].points -= 1;
        } 
      }
     
      if (this.controlPoints[point].points == 0) {
        this.controlPoints[point].team = 0;
      }else if (this.controlPoints[point].team == 1) {
        this.teamPoints["2"] -= 1;
      }else if (this.controlPoints[point].team == 2) {
        this.teamPoints["1"] -= 1;
      }
      
    }
    
  },
  /************************************************************************
  *         Game Over
  *************************************************************************/
  gameOver: function(){
    clearInterval (this.updateDynamic);
    clearInterval(this.updateWorld);
    thisGame = this;
    setTimeout(function(){
      thisGame.RoutingServer.GameOver();
    }, 3000);
    
  }//game over
}// end object