module.exports ={
  startTimeAsPower: 0, // to calculate statistics of what power most used
  Player: require('./player.js'),
  Bullet: require('./bullet.js'),
  Minion: require('./minion.js'),
  Boss: require('./boss.js'),
  HealthPack: require('./healthPack.js'),
  RoutingServer: require('../server.js'),
  players: {},
  bullets: [],
  minions: [],
  bosses: [],
  healthPacks: [],
  MAXTEAMPOINTS:500,
  worldLimits: {
      top: 0,
      left: 0,
      right: 1500,
      bottom: 1500
    },
  teamPoints:{
      "1": 0,
      "2": 0
    },
    spawnAreas: [{ },{ }],
    updateDynamic: "",
    updateWorld: "",
    /************************************************************************
    *         Create World Static Objects
    *************************************************************************/
    controlPoints: new Array(),
    minionFactories: new Array(),
  
  populateControlPoints: function(){
    this.controlPoints= new Array();
    this.minionFactories= new Array(),
    controlPoint = {
      team: 0,
      area: 75,
      conqueringTeam: 0,
      points: 0,
      type:"shooting",
      minionSpawnTick: 0,
      targets: [],
      width: 25,
      height: 25,
      x: 0,
      y: 0
    };
    const extraDistance = 100;
    const distanceFromCenter = this.Boss.area+this.Boss.radius+controlPoint.width+extraDistance;
    const distanceFromBorder = controlPoint.area+controlPoint.width+extraDistance;

    const cp1 = JSON.parse(JSON.stringify(controlPoint));
    cp1.x = (this.worldLimits.right/2) - distanceFromCenter;
    cp1.y = (this.worldLimits.right/2) - distanceFromCenter;

    const cp2 = JSON.parse(JSON.stringify(controlPoint));
    cp2.x = (this.worldLimits.right/2) + distanceFromCenter;
    cp2.y = (this.worldLimits.right/2) - distanceFromCenter;
    

    const cp3 = JSON.parse(JSON.stringify(controlPoint));
    cp3.x = (this.worldLimits.right/2) - distanceFromCenter;
    cp3.y = (this.worldLimits.right/2) + distanceFromCenter;


    const cp4 = JSON.parse(JSON.stringify(controlPoint));
    cp4.x = (this.worldLimits.right/2) + distanceFromCenter;
    cp4.y = (this.worldLimits.right/2) + distanceFromCenter;

    const cp5 = JSON.parse(JSON.stringify(controlPoint));
    cp5.x = (this.worldLimits.right/2);
    cp5.y = (this.worldLimits.right/2) - distanceFromCenter;

    const cp6 = JSON.parse(JSON.stringify(controlPoint));
    cp6.x = (this.worldLimits.right/2);
    cp6.y = (this.worldLimits.right/2) + distanceFromCenter;

    const cp7 = JSON.parse(JSON.stringify(controlPoint));
    cp7.x = (this.worldLimits.right/2) - distanceFromCenter;
    cp7.y = (this.worldLimits.right/2);


    const cp8 = JSON.parse(JSON.stringify(controlPoint));
    cp8.x = (this.worldLimits.right/2) + distanceFromCenter;
    cp8.y = (this.worldLimits.right/2);

    const cp11 = JSON.parse(JSON.stringify(controlPoint));
    cp11.x = this.worldLimits.left+distanceFromBorder;
    cp11.y = this.worldLimits.top+distanceFromBorder;
    cp11.type = "minionFactory"
    cp11.targets = [{x: cp1.x, y: cp1.y}, {x: cp5.x, y: cp5.y}, {x: cp7.x, y: cp7.y} ];

    const cp21 = JSON.parse(JSON.stringify(controlPoint));
    cp21.x = this.worldLimits.right-distanceFromBorder;
    cp21.y = this.worldLimits.top+distanceFromBorder;
    cp21.type = "minionFactory"
    cp21.targets = [{x: cp2.x, y: cp2.y}, {x: cp8.x, y: cp8.y}, {x: cp5.x, y: cp5.y} ];

    const cp31 = JSON.parse(JSON.stringify(controlPoint));
    cp31.x = this.worldLimits.left+distanceFromBorder;
    cp31.y = this.worldLimits.bottom-distanceFromBorder;
    cp31.type = "minionFactory"
    cp31.targets = [{x: cp3.x, y: cp3.y}, {x: cp7.x, y: cp7.y}, {x: cp6.x, y: cp6.y} ];

    const cp41 = JSON.parse(JSON.stringify(controlPoint));
    cp41.x = this.worldLimits.right-distanceFromBorder;
    cp41.y = this.worldLimits.bottom-distanceFromBorder;
    cp41.type = "minionFactory"
    cp41.targets = [{x: cp4.x, y: cp4.y}, {x: cp6.x, y: cp6.y}, {x: cp8.x, y: cp8.y} ];

    const cp51 = JSON.parse(JSON.stringify(controlPoint));
    cp51.x = (this.worldLimits.right/2)
    cp51.y = this.worldLimits.top+distanceFromBorder;
    cp51.type = "minionFactory"
    cp51.targets = [{x: cp5.x, y: cp5.y}, {x: cp1.x, y: cp1.y}, {x: cp2.x, y: cp2.y} ];

    const cp61 = JSON.parse(JSON.stringify(controlPoint));
    cp61.x = (this.worldLimits.right/2)
    cp61.y = this.worldLimits.bottom-distanceFromBorder;
    cp61.type = "minionFactory"
    cp61.targets = [{x: cp6.x, y: cp6.y}, {x: cp3.x, y: cp3.y}, {x: cp4.x, y: cp4.y} ];

    const cp71 = JSON.parse(JSON.stringify(controlPoint));
    cp71.x = this.worldLimits.left+distanceFromBorder;
    cp71.y = (this.worldLimits.right/2);
    cp71.type = "minionFactory"
    cp71.targets = [{x: cp7.x, y: cp7.y}, {x: cp3.x, y: cp3.y}, {x: cp1.x, y: cp1.y} ];

    const cp81 = JSON.parse(JSON.stringify(controlPoint));
    cp81.x = this.worldLimits.right-distanceFromBorder;
    cp81.y = (this.worldLimits.right/2);
    cp81.type = "minionFactory"
    cp81.targets = [{x: cp8.x, y: cp8.y}, {x: cp2.x, y: cp2.y}, {x: cp4.x, y: cp4.y} ];
    
    this.controlPoints.push( cp1,cp2,cp3,cp4,cp5,cp6,cp7,cp8, );
    this.minionFactories.push( cp11,cp21,cp31,cp41,cp51,cp61,cp71,cp81, );

  },
  /************************************************************************
  *      Functions on repeat Timmer
  *************************************************************************/
  start: function(){
    thisGame  = this;

    thisGame.RoutingServer.sendAllGameInfo(false);//iniciate statistics
    
    

    this.teamPoints[1]= this.MAXTEAMPOINTS;
    this.teamPoints[2]= this.MAXTEAMPOINTS;

    this.spawnAreas=  [
      {
      'team': 1,
      'area': 200,
      'x': 0,
      'y': this.worldLimits.bottom
      },{
      'team': 2,
      'area': 200,
      'x': this.worldLimits.right,
      'y': this.worldLimits.top
    }]

    boss1= {};
    boss2= {};
    for (const key in this.Boss) {
      if (this.Boss.hasOwnProperty(key)) {
        boss1[key] = this.Boss[key];
        boss2[key] = this.Boss[key];
      }
    }

    boss1.team= 1;
    boss1.x = this.worldLimits.right/2+boss1.radius;
    boss1.y = this.worldLimits.bottom/2-boss1.radius;
    boss2.team= 2;
    boss2.x = this.worldLimits.right/2-boss2.radius,
    boss2.y = this.worldLimits.bottom/2+boss2.radius,
    this.bosses.push(boss1);
    this.bosses.push(boss2);


    this.populateControlPoints();

    this.togglePause();


    for (const key in this.players) {
      const player = this.players[key];
      if (player.team == 1) {
        player.x = this.worldLimits.left+50
        player.y = this.worldLimits.bottom-50        
      } else if (player.team == 2)  {
        player.x = this.worldLimits.right-50
        player.y = this.worldLimits.top+50
      }
    }

  },
  isPaused: true,
  togglePause(){
    this.isPaused = !this.isPaused;
    if(this.isPaused){
      if(this.updateDynamic != null){
        clearInterval (this.updateDynamic);
      }
      if(this.updateWorld != null){
        clearInterval (this.updateWorld);
      }
    }else{
        //update dynamic objects (player, bullets)
      this.updateDynamic = setInterval(function() {
        thisGame.moveBullets();
        thisGame.movePlayers();
        thisGame.moveMinons();
        thisGame.RoutingServer.updateDynamicObjects(thisGame.players, thisGame.bullets, thisGame.minions);
        thisGame.checkIfPowersActive();
      }, 1000 / 30);
      //update static objects (controlPoints)
      this.updateWorld = setInterval(function() {
        thisGame.checkPlayersInFactory();
        thisGame.checkMinionsInPoint();
        thisGame.checkTowerFire();
        thisGame.createMinions();
        thisGame.checkHeathPackLifetime();
        thisGame.teamPoints[1] -= 1;
        thisGame.teamPoints[2] -= 1;

        

        // Send world objects to the clients
        thisGame.RoutingServer.updateWorldObjects(thisGame.controlPoints, thisGame.minionFactories, thisGame.teamPoints, thisGame.healthPacks, thisGame.bosses, thisGame.spawnAreas);
        if (thisGame.teamPoints["1"]  <= 0 || thisGame.teamPoints["2"] <= 0 ) {
          thisGame.gameOver();
        }
      }, 1000 / 2);

      setInterval(function() {thisGame.RoutingServer.sendAllGameInfo(false);}, 5000 );
    }
  },
  /************************************************************************
  *         Create Bullets
  *************************************************************************/
  fireBullet: function (x,y,id, Special){
    if (this.players[id]) {
      //check if is not spectator
      if (this.players[id].team != 0) {
        //check if the player weapon is on cooldown
        if (this.players[id].weaponCoolDown+300 < Date.now()) {
          //last time fired, for CD calculations
          this.players[id].weaponCoolDown = Date.now();

          //get coords for bullet direction
          bulletX = this.players[id]['x'] - x;
          bulletY = this.players[id]['y'] - y; 

          //create a normalised vector for the direction
          const long = Math.sqrt(bulletX*bulletX +bulletY*bulletY);
          const dirX = bulletX/long;
          const dirY = bulletY/long;


          //create the bullet object
          const newbullet = JSON.parse(JSON.stringify(this.Bullet));
           newbullet.owner = id;
           newbullet.team = this.players[id].team;
           newbullet.dirX = dirX;
           newbullet.dirY = dirY;
           newbullet.creation= Date.now(),
           newbullet.x = this.players[id]['x'];
           newbullet.y = this.players[id]['y'];
          
          //special power of one of the characters
           if (Special === true) {
            newbullet.speed *= 2.5;
            newbullet.damage = 35;
            newbullet.radius = 20;
          } 

          this.bullets.push(newbullet);
        }
      }
    }
  },
 /************************************************************************
  *         Create boss Attacks
  *************************************************************************/
  bossAttack: function(x,y,boss){   
    const rotateVector = function(vec, ang){
      ang = -ang * (Math.PI/180);
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
    };
    
    //get coords for bullet direction
    bulletX = boss['x'] - x;
    bulletY = boss['y'] - y; 

    //create a normalised vector for the direction
    const long = Math.sqrt(bulletX*bulletX +bulletY*bulletY);
    const dirX = bulletX/long;
    const dirY = bulletY/long;

    
    for (let index = 1; index < 3; index++) {
      vector = Array(dirX, dirY);
      newVector = rotateVector(vector, (-15*index)+7)

       //create the bullet object
    const newbullet = JSON.parse(JSON.stringify(this.Bullet));
    newbullet.owner = boss;
    newbullet.team = boss.team;
    newbullet.dirX = newVector[0];
    newbullet.dirY = newVector[1];
    newbullet.creation= Date.now(),
    newbullet.x = boss['x'];
    newbullet.y = boss['y'];
    newbullet.speed = 8;
    newbullet.radius = 8;
    newbullet.damage = 25;

   this.bullets.push(newbullet);
    }
    for (let index = 1; index < 3; index++) {
      vector = Array(dirX, dirY);
      newVector = rotateVector(vector, (+15*index)-7)

       //create the bullet object
    const newbullet = JSON.parse(JSON.stringify(this.Bullet));
    newbullet.owner = boss;
    newbullet.team = boss.team;
    newbullet.dirX = newVector[0];
    newbullet.dirY = newVector[1];
    newbullet.creation= Date.now(),
    newbullet.x = boss['x'];
    newbullet.y = boss['y'];
    newbullet.speed = 8;
    newbullet.radius = 8;
    newbullet.damage = 25;

   this.bullets.push(newbullet);
    }
  },

  /**
   * choose power
   */
  choosePower: function(playerid, power){
   
    const player = this.players[playerid];
    if (player && !player.powerIsActive) {

      //check if is not spectator
      if (player.team == 1) { 
        const dx = player.x - this.worldLimits.left;
        const dy = player.y -this.worldLimits.bottom;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance<this.spawnAreas[0].area) {
          player.power = power;
        }
      } else if (player.team == 2){
        const dx = player.x - this.worldLimits.right;
        const dy = player.y -this.worldLimits.top;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance<this.spawnAreas[0].area) {
          player.power = power;
        }
        
      }
      
    }
  },
   /************************************************************************
  *         Activate Avatar Powers
  *************************************************************************/
  activatePower: function(id, mouseX, mouseY){
    if (this.players[id]) {

      const player = this.players[id];
      //check if is not spectator
      if (player.team != 0) {
        switch (player.power) {
          case 1:
            //check if the player power is on cooldown
            if (player.powerStartCooldownTimer+player.powerCooldown < Date.now() && !player.powerIsActive) {
              player.powerActivation = Date.now();                  
              player.healthPoints += 100;
              player.radius = player.radius*2;

              player.powerIsActive = true;
            }
            break;
            case 2:
            //check if the player power is on cooldown
            if (player.powerStartCooldownTimer+player.powerCooldown < Date.now() && !player.powerIsActive) {
              player.powerActivation = Date.now();                  
              player.speed += 4;
              player.radius *= 0.9
              player.powerIsActive = true;
              /**
               * teleport
               */
              /*
              player.powerActivation = Date.now();  

            
                  // get coords x and y of the direction vector and the lenght of the direction vector
                  const dirX = mouseX-player.x;
                  const dirY = mouseY-player.y;
                  const long = Math.sqrt((dirX*dirX) + (dirY*dirY));
                  
          
                  //apply the direction vector to the player position to get the desired destination
                  let destinationX = player.x + (dirX/long)*350;// normalize the vector
                  let destinationY = player.y + (dirY/long)*350;
                    
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
                  
                    //check if the desired destination is available, and apply the new coords
                  if (destinationX >= this.worldLimits.left && 
                    destinationX <= this.worldLimits.right && 
                    destinationY >= this.worldLimits.top && 
                    destinationY <= this.worldLimits.bottom && 
                    !isObj ) {
                    player.x = destinationX;
                    player.y = destinationY;
                     player.powerIsActive = true;
                  }*/

             
            }
            break;
            case 3:
            if (player.powerStartCooldownTimer+player.powerCooldown < Date.now() && !player.powerIsActive) {
              player.powerActivation = Date.now()

              this.fireBullet(mouseX, mouseY, id, true)
              player.powerIsActive = true;
            }
            break;
          default:
            break;
        }
        
      }
    }
  },
  /************************************************************************
   * Check power duration and condition to stop
   ***********************************************************************/
  checkIfPowersActive: function(){

    for (playerKey in this.players) {
      if (playerKey != null && this.players[playerKey].powerIsActive){
        player = this.players[playerKey];

        switch (player.power) {
          case 1:
            if (player.powerActivation+7000 < Date.now()) {
              player.powerStartCooldownTimer = Date.now();
              if (player.healthPoints > 100) {
                player.healthPoints = 100;
              }
              player.radius = player.radius/2;
              player.powerIsActive = false;
            }else{

            }
            break;
            case 2:
            if (player.powerActivation+2000 < Date.now()) {
              player.powerStartCooldownTimer = Date.now();
              player.speed -= 4;
              player.radius /= 0.9
              player.powerIsActive = false;
            }
            break;
            case 3:
            if (player.powerActivation <= Date.now()) {
              player.powerStartCooldownTimer = Date.now();
              player.powerIsActive = false;
            }
        
          default:
            break;
        }

        

      }
    }

  },
  /************************************************************************
   *  utilitarian function to make the avatars take damage
  ********************************************************************** */
  avatarTakeDamage: function(player, dmg){
    player.healthPoints -= dmg;

    if (player.healthPoints <= 0) {
      this.players[player.id].statistics.deaths++;

      player.healthPoints =100;
      player.respawnTime = Date.now();

      if (player.team == 1) {
        player.x = this.worldLimits.left+30;
        player.y = this.worldLimits.bottom-30;
      } else if(player.team == 2)  {
        player.x = this.worldLimits.right-30;
        player.y = this.worldLimits.top+30;
      }
     return true; 
    }
    return false;
  },
  /************************************************************************
  *         Make Bullets Move
  *************************************************************************/
  moveBullets: function(){
     for (key in this.bullets) {

      if (key != null) {
        bullet = this.bullets[key];
        //check how long the bullet has been alive, if still going add the vector direction else destroy it
        if (Date.now()-bullet.creation < bullet.lifetime) {
          const destinationX = bullet.x - bullet.dirX*bullet.speed;
          const destinationY = bullet.y - bullet.dirY*bullet.speed;

          //check if the desired destination is available, and apply the new coords
          if (destinationX >= this.worldLimits.left && destinationX <= this.worldLimits.right ) {
            bullet.x = destinationX;
          }else{
            this.bullets.splice(bullet, 1);
            return;
          }
          if (destinationY >= this.worldLimits.top && destinationY <= this.worldLimits.bottom ) {
            bullet.y = destinationY; 
          }else{
            this.bullets.splice(bullet, 1);
            return;
          }

          //check collision with players (not shooter)
          for (playerKey in this.players) {
            player = this.players[playerKey];
            if (player != bullet.owner) {
              const dx = player.x - bullet.x;
              const dy = player.y - bullet.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if ( bullet.team != player.team &&  bullet.team != 0 && player.team  != 0 ){
                if (distance < player.radius + bullet.radius) {
                  //Colision with other Players
                  
                  if (this.avatarTakeDamage(player, bullet.damage)) {
                    if (this.players[bullet.owner] != null) {
                      this.players[bullet.owner].statistics.playersKilled++;
                    }
                  }
                  this.bullets.splice(key, 1);
                  return;
                }
              }
              
            }
          }
         
          for (key in this.minions) {
             const  minion = this.minions[key];
            if ( minion.team != bullet.team) {
              const dx = minion.x - bullet.x;
              const dy = minion.y  - bullet.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
                
              
              if (distance < minion.radius + bullet.radius) {
                //Colision with Enemy Minions

                const newHealthPack = JSON.parse(JSON.stringify(this.HealthPack));
                newHealthPack.team = bullet.team;
                newHealthPack.currentX = bullet.x;
                newHealthPack.currentY = bullet.y;
                newHealthPack.creation = Date.now();

                this.healthPacks.push(newHealthPack);
                this.minions.splice(key, 1);
                if (this.players[bullet.owner] != null) {
                  this.players[bullet.owner].statistics.minionsKilled++;
                }
                
                
              }              
            }
          }

          for (bossKey in this.bosses) {
            const  boss = this.bosses[bossKey];
           if ( boss.team != bullet.team) {
            const dx = boss.x - bullet.x;
            const dy = boss.y  - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
             if (distance < boss.radius + bullet.radius) {
               //Colision with Enemy boss               
               if (bullet.team == 1) {
                 this.teamPoints[2] -= 1;
               } else if (bullet.team == 2) {
                this.teamPoints[1] -= 1;
               }
                this.bullets.splice(bullet, 1);
                return;
             }              
           }
         }
        //  Verify that there are no world objects in X and Y coords
        const list = this.controlPoints.concat(this.minionFactories);
        for (key in list) {
          x = destinationX > list[key].x && destinationX < list[key].x+list[key].width;
          y = destinationY > list[key].y && destinationY< list[key].y+list[key].height;
          if (x && y) {
            //Collision with World Object
            this.bullets.splice(bullet, 1);
            return;
          }
        }
        
        //  verify avatar is shooting starting zone
        for (key in this.spawnAreas) {
          const spawnArea = this.spawnAreas[key]
              const dx = spawnArea.x - bullet.x;
              const dy = spawnArea.y  - bullet.y;
              const  distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= spawnArea.area) {
            //Collision with spawn areas
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
     for (playerKey in this.players) {
      if (playerKey != null ) {
        const player = this.players[playerKey];
        // get coords x and y of the direction vector and the lenght of the direction vector
        const dirX = player.dirX;
        const dirY = player.dirY;
        const long = Math.sqrt(0+(dirX*dirX) + (dirY*dirY));
        

        //apply the direction vector to the player position to get the desired destination
        let destinationX = player.x + (player.dirX)*player.speed;
        let destinationY = player.y + (player.dirY)*player.speed;
        
        // normalize the vector if necessary
        if (long != 0) {
          destinationX = player.x + (player.dirX/long)*player.speed;
          destinationY = player.y + (player.dirY/long)*player.speed;
        }
          
        //  Verify that there are no world objects in X and Y coords
        isObj = false;
        const list = this.controlPoints.concat(this.minionFactories);
        for (key in list) {
          x = destinationX > list[key].x && destinationX < list[key].x+list[key].width;
          y = destinationY > list[key].y && destinationY< list[key].y+list[key].height;
          if (x && y) {
            isObj = true;
            break;
          }
        }
        
        //check colisions with other players.
        isPlayer = false;
        /*
        for (otherPlayer in players) {
            if (otherPlayer != player) {
              dx = players[otherPlayer].x - destinationX;
              dy = players[otherPlayer].y - destinationY;
              distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < players[otherPlayer].radius + player.radius) {
                isPlayer = true;
                break;
              }
            }
          }
          */
        for (const key in this.healthPacks) {
          if (this.healthPacks.hasOwnProperty(key)) {
            const healthPack = this.healthPacks[key];
            dx = healthPack.currentX - destinationX;
            dy = healthPack.currentY - destinationY;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < healthPack.radius + player.radius) {
              if (healthPack.team == player.team ){
                if((player.healthPoints + healthPack.ammountHealed) >= 100){
                  player.healthPoints =100;
                }else{
                  player.healthPoints += healthPack.ammountHealed;
                }
              }
              
              this.healthPacks.splice(key, 1);
            }
          }
        }

        for (const key in this.bosses) {
          if (this.bosses.hasOwnProperty(key)) {
            const boss = this.bosses[key];
            if (boss.team != player.team  && player.team  != 0 ) {
            
              dx = boss.x - destinationX;
              dy = boss.y - destinationY;
              distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < boss.area) {
                if (boss.canAttack()) {
                  this.bossAttack(player.x,player.y, boss);
                }
              }
            }
          }
        }
        
        let isOnRespawnTimmer = false;
        if (player.respawnTime+5000 > Date.now()) {
          isOnRespawnTimmer = true;
        }

          //check if the desired destination is available, and apply the new coords
        if (destinationX >= this.worldLimits.left && destinationX <= this.worldLimits.right && !isObj && !isPlayer && !isOnRespawnTimmer) {
          player.x = destinationX;
        }
        if (destinationY >= this.worldLimits.top && destinationY <= this.worldLimits.bottom && !isObj && !isPlayer && !isOnRespawnTimmer) {
          player.y = destinationY; 
        }

      }
    }
  },
    /************************************************************************
  *         Check if towers
  *************************************************************************/
 checkTowerFire: function(){
    

    for (keypoint in this.controlPoints) {
      tower = this.controlPoints[keypoint];
      
      if (tower.team !=0 && tower.points >= 5) {
        if (tower.team == 1) {
          this.teamPoints[2] -= 25;
          tower.points -= 5;
        } else if (tower.team == 2){
          this.teamPoints[1] -= 25;
          tower.points -= 5;
        } 
        this.RoutingServer.towerAttack(tower);
      }
      if (tower.points <= 5) {
        tower.team = 0;
      }else if (tower.points >= 5) {
        tower.team = tower.conqueringTeam;
      }
    }
   
   
  },
  /************************************************************************
  *         Check if minions is in Control Point
  *************************************************************************/
  checkMinionsInPoint: function(){


    if (this.minions.length > 0) {

    
      for (key in this.minions) {
        minion = this.minions[key];
        for (keypoint in this.controlPoints) {
          tower = this.controlPoints[keypoint];

          centerX = tower.x+(tower.width/2);
          centerY = tower.y+(tower.height/2);

          if (minion.team != 0) {  
            dx = minion.x - centerX;
            dy = minion.y - centerY;
            distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < tower.area) {
              if (minion.team == 1) {
                if (tower.points == 0){
                  tower.conqueringTeam = 1;
                  tower.points = 1;
                  this.minions.splice(key, 1);
                }else if (tower.conqueringTeam == 1 && tower.points < 10) {
                  tower.points += 1;
                  this.minions.splice(key, 1);
                }else if (tower.conqueringTeam == 2 && tower.points > 0) {
                  tower.points -= 1;
                  this.minions.splice(key, 1);
                }   
              }else if (minion.team == 2) {
                if (tower.points == 0){
                  tower.conqueringTeam = 2;
                  tower.points = 1;
                  this.minions.splice(key, 1);
                }else if (tower.conqueringTeam == 2 && tower.points < 10) {
                  tower.points += 1;
                  this.minions.splice(key, 1);
                }else if (tower.conqueringTeam == 1 && tower.points > 0) {
                  tower.points -= 1;
                  this.minions.splice(key, 1);
                }
              }
            }
          }
        }
      }
    }
  },
  /************************************************************************
  *         Check if Player is in minion factory
  *************************************************************************/
 checkPlayersInFactory: function(){
  for (key in this.minionFactories) {
    minionFactory= this.minionFactories[key];

    centerX = minionFactory.x+(minionFactory.width/2);
    centerY = minionFactory.y+(minionFactory.height/2);
    playerInArea1 =0;
    playerInArea2 =0;
    for(playerKey in this.players){
      player = this.players[playerKey];
      if (player.team != 0) {  
        dx = player.x - centerX;
        dy = player.y - centerY;
        distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + minionFactory.area) {
          if (player.team == 1) {
            playerInArea1++;
          }else if (player.team == 2) {
            playerInArea2++
          }
          //++player.statistics.towerContribution;//statistics contribution
        }
      }
    }

    if (playerInArea1>playerInArea2) {
      if (minionFactory.points == 0){
        minionFactory.conqueringTeam = 1;
        minionFactory.points = 1;
      }else if (minionFactory.conqueringTeam == 1 && minionFactory.points < 10) {
        minionFactory.points += 1;
      }else if (minionFactory.conqueringTeam == 2 && minionFactory.points > 0) {
        minionFactory.points -= 1;
      }    
    }else if (playerInArea2>playerInArea1) {;
      if (minionFactory.points == 0){
        minionFactory.conqueringTeam = 2;
        minionFactory.points = 1;
      }else if (minionFactory.conqueringTeam == 2 && minionFactory.points < 10) {
        minionFactory.points += 1;
      }else if (minionFactory.conqueringTeam == 1 && minionFactory.points > 0) {
        minionFactory.points -= 1;
      } 
    }
    if (minionFactory.points == 0) {
      minionFactory.team = 0;
    }else if (minionFactory.points == 10) {
        minionFactory.team = minionFactory.conqueringTeam;
    }
  }
  
},
   /************************************************************************
  *        Spawn Minions from factorys
  *************************************************************************/
  createMinions: function(){ 
      for(key in this.minionFactories){
        const minionFactory= this.minionFactories[key];
        if(minionFactory.team != 0){

          if(minionFactory.minionSpawnTick == 0){
            const newMinon = JSON.parse(JSON.stringify(this.Minion));
            newMinon.x = minionFactory.x+minionFactory.width/2;
            newMinon.y = minionFactory.y+minionFactory.height/2;
            newMinon.team = minionFactory.team;
            newMinon.spawner = controlPoint;
            newMinon.target = minionFactory.targets[Math.floor(Math.random()*minionFactory.targets.length)];
            this.minions.push(newMinon);
            minionFactory.minionSpawnTick++;
          }else{
            if (minionFactory.minionSpawnTick >= 5){
              minionFactory.minionSpawnTick= 0;
            }else{
              minionFactory.minionSpawnTick++;
            }
          }
        }
      }
  },
  /************************************************************************
  *        Move Minions
  *************************************************************************/
  moveMinons: function(){
    for (const key in this.minions) {
      if (this.minions.hasOwnProperty(key)) {

        const minion = this.minions[key];
        //get coords for bullet direction

        //Get Minion Final target
        distX =  (minion.x - minion.target.x);
        distY =  (minion.y -  minion.target.y);
        let distanceCenter = Math.sqrt(distX*distX +distY*distY);
        let destinationX, destinationY;

        // if he is too close to the target, just go there, else Wander around searching for the target
        if (distanceCenter > 15) {


          if (minion.changeDirectionTimmer+minion.changeDirectionCoolDown < Date.now()) {
            minion.changeDirectionTimmer = Date.now();
            
            switch (Math.floor(Math.random()*(minion.CorrectDirectionChance+4))) {
            case 1:
              minion.randomx = Math.floor(Math.random()*(minion.x - this.worldLimits.right));
              minion.randomy = Math.floor(Math.random()*(minion.y - this.worldLimits.bottom));
              break;
              case 2:
              minion.randomx = -Math.floor(Math.random()*(minion.x - this.worldLimits.right));
              minion.randomy = -Math.floor(Math.random()*(minion.y - this.worldLimits.bottom));
              break;
              case 3:
              minion.randomx = +Math.floor(Math.random()*(minion.x - this.worldLimits.right));
              minion.randomy = -Math.floor(Math.random()*(minion.y - this.worldLimits.bottom));
              break;
              case 4:
              minion.randomx = -Math.floor(Math.random()*(minion.x - this.worldLimits.right));
              minion.randomy = +Math.floor(Math.random()*(minion.y - this.worldLimits.bottom));
              break;
          
            default:
              minion.randomx = 0;
              minion.randomy = 0;
              break;
          }
          }
          
            
          //create a normalised vector for the direction
          dirX =  (distX)+minion.randomx;
          dirY =  (distY)+minion.randomy;
          
          let long = Math.sqrt(dirX*dirX +dirY*dirY);
          dirXNormalized = dirX/long;
          dirYNormalized = dirY/long;

          //move to destination or stop if destination to close (to stop the gittering)
          
          if (long > 5) {
            destinationX = minion.x - dirXNormalized*minion.speed;
            destinationY = minion.y - dirYNormalized*minion.speed;
          }else{
            destinationX = minion.x;
            destinationY = minion.y;
          }
        } else {
          dirXNormalized = distX/distanceCenter;
          dirYNormalized = distY/distanceCenter;
          destinationX = minion.x - dirXNormalized*minion.speed;
          destinationY = minion.y - dirYNormalized*minion.speed;

        }

        if((destinationX <= distX+10 && destinationX >= distX-10) 
          && (destinationY <= distY+10 && destinationY >= distY-10) ){
            this.minions.splice(key, 1);
          }else{

            //check collision with players
          for (playerKey in this.players) {
            player = this.players[playerKey];
            if(player.team != minion.team){
              dx = player.x - minion.x;
              dy = player.y - minion.y;
              distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < minion.radius+player.radius){   
                if (minion.lastAttack+minion.attackCooldown  < Date.now()) {
                  //last time fired, for CD calculations
                  minion.lastAttack = Date.now();
                  this.avatarTakeDamage(player, minion.minionAttackDamage)
                  
                  if (player.healthPoints <= 0) {
                    player.team = 0;
                    player.healthPoints =100;
                  }
                }                 
              }
            }              
          }
          //move minion to his next step            
          minion.x = destinationX;
          minion.y = destinationY;
        }
      }       
        
    }
    
  },
  /************************************************************************
  *       Check HealthPacks life time
  *************************************************************************/
  checkHeathPackLifetime: function(){
    for (const key in this.healthPacks) {
      if (this.healthPacks.hasOwnProperty(key)) {
        const healthPack = this.healthPacks[key];
        if(healthPack.creation+healthPack.duration <= Date.now()){
          this.healthPacks.splice(key, 1);
        }
        
      }
    }
  },
  /************************************************************************
  *         Game Over
  *************************************************************************/
  gameOver: function(){
    this.RoutingServer.sendAllGameInfo(true);
    this.bullets.splice(0,this.bullets.length);
    this.bullets = [];
    this.minions.splice(0,this.minions.length);
    this.minions = [];
    this.bosses.splice(0,this.bosses.length);
    this.bosses = [];
    this.healthPacks.splice(0,this.healthPacks.length);
    this.healthPacks = [];
    clearInterval (this.updateDynamic);
    clearInterval(this.updateWorld);
    thisGame = this;
    setTimeout(function(){
      thisGame.RoutingServer.GameOver();
    }, 2000);
    
  }//game over
}// end object