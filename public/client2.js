
const ipAddress = 'localhost';
const port = '3000';
const socket = io();
socket.connect('http://' + ipAddress + ':' + port);


this.room= "";
//this.canvas= {width: 650, height: 650};
this.worldSize= 1500;
this.backgroundImage= {};
this.towerAttacks= [];


this.backgroundImage.image = new Image();
this.backgroundImage.image.src = "imgs/hex.png";
this.backgroundImage.size = 400;
this.backgroundImage.iteration = Math.ceil(this.worldSize/this.backgroundImage.size);

//socket  = Socket.connection;

const _this = this;

const canvas = document.getElementById('canvas');
const menu = document.getElementById('menu');
let keyboard = $('input[name=keyboard]:checked').val();

$('input[name=keyboard]').change(function() {
    keyboard =$('input[name=keyboard]:checked').val();
});

// listen for what room we are on
socket.on('room', function (r) {
   enterRoom(r);
});

socket.on("refreshLobby", function(playerList){
    
    $("#nb").load("index.html #nb", function(){
      $("#nb").html(Object.keys(playerList).length)
    });
  
    let listP1 = "";
    let listP2 = "";
    for (const p in playerList){
      if (playerList.hasOwnProperty(p)){
        if (playerList[p].team == 1) {
          listP1 += "<li>"+playerList[p].name+"</li>";
        }
        else if (playerList[p].team == 2) {
          listP2 += "<li>"+playerList[p].name+"</li>";
        }
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
        socket.emit('enterGame');
       });
      $("#btnTeam1").click(function(event){
        socket.emit('team', 1 , $("#nickname").val());
      });
      
      $("#btnTeam2").click(function(event){
        socket.emit('team', 2, $("#nickname").val());
      }); 
    } else{
        menu.style["display"] = "none";
        canvas.style["display"] = "block";
    
    

        
 
 const camera = {
    xOffset: "xOffset",
    yOffset: "yOffset",
    worldSize: "worldSize",
    constructor(xOffset,yOffset, worldSize){
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.worldSize = worldSize;
},
    centerOnObject(centerOfCamera){
        if(centerOfCamera.x-canvas.width/2 > 0 && centerOfCamera.x+canvas.width/2 < this.worldSize){
            this.xOffset = centerOfCamera.x-canvas.width/2;
        }else if(centerOfCamera.x-canvas.width/2 <= 0){
            this.xOffset = 0;
        }else if(centerOfCamera.x+canvas.width/2 >= this.worldSize){
            this.xOffset = this.worldSize-canvas.width;
        }
        if(centerOfCamera.y-canvas.height/2 > 0 && centerOfCamera.y+canvas.height/2 < this.worldSize){
            this.yOffset = centerOfCamera.y-canvas.height/2;
        }else if(centerOfCamera.y-canvas.height/2 <= 0){
            this.yOffset = 0;
        }else if(centerOfCamera.y+canvas.height/2 >= this.worldSize){
            this.yOffset = this.worldSize-canvas.height;
        }      
    }
}               
//instantitate camera values
camera.constructor(0,0, this.worldSize);

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
let spawnAreas = [];
let myCharacter = {};


let controlPoints = new Array();
let minionsFactories =  new Array();
let teamPoints ={
"1": 0,
"2": 0
};
let healthPacks= new Array();

//const canvas = document.getElementById('canvas');
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
function getMousePosition(x, y) {
    movement.clickX = x+camera.xOffset;
    movement.clickY = y+camera.yOffset;                
}
canvas.addEventListener("mousemove", function(e) {
    context.mouse.x = e.offsetX;
    context.mouse.y = e.offsetY;
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

if(keyboard == "QWERTY"){
//Keyboard Events
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
    case 65: // A
        movement.left = true;
        break;
    case 87: // W
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
    case 65: // A
    movement.left = false;
    break;
    case 87: // W
    movement.up = false;
    break;
    case 68: // D
    movement.right = false;
    break;
    case 83: // S
    movement.down = false;
    break;
    case 49: // 1
    socket.emit('choosePower', 1);
    break;
    case 50: // 2
    socket.emit('choosePower', 2);
    break;
    case 51: // 3
    socket.emit('choosePower', 3);
    break;
    case 32: // space
    socket.emit('power', movement);
    break;
}
});
}else{
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
    socket.emit('choosePower', 1);
    break;
    case 50: // 2
    socket.emit('choosePower', 2);
    break;
    case 51: // 3
    socket.emit('choosePower', 3);
    break;
    case 32: // space
    socket.emit('power', movement);
    break;
}
});
}


/**
    *  Recursive Function to send client information
    **/

let sendInputToServer;
let getObjectsFromServer;
if (room == "game") {
    sendInputToServer = setInterval(function() {
        getMousePosition(context.mouse.x,context.mouse.y )
        socket.emit('movement', movement);
    }, 1000 / 30);

    /**
    *   Function to Draw Objects
    **/
    getObjectsFromServer = setInterval(function() { 

        camera.centerOnObject(myCharacter);
    
        /**
         * - Draw Game
         **/
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground(camera.xOffset, camera.yOffset);
    
    
        // draw attacks that the tower inflincts in the boss
        for (const key in _this.towerAttacks) {
            towerAttack = _this.towerAttacks[key];
            if (_this.towerAttacks.hasOwnProperty(key) && _this.towerAttacks != null) {
                
                //determine target
                let target = {};
                for (const key in bosses) {
                    if (bosses.hasOwnProperty(key)) {
                        const boss = bosses[key];
                        if (boss.team != towerAttack.team) {
                            target = boss;
                        }
                    }
                }
                
                //draw the lazer triangle
                chooseColor(towerAttack.team);
                //draw the shape
                context.beginPath();
                context.moveTo(towerAttack.x-camera.xOffset+(controlPoint.width/2)-10,  towerAttack.y-camera.yOffset+(towerAttack.height/2)-10);
                context.lineTo(target.x-camera.xOffset,  target.y-camera.yOffset);
                context.lineTo(towerAttack.x-camera.xOffset+(controlPoint.width/2)+10,  towerAttack.y-camera.yOffset+(towerAttack.height/2)+10);
                context.fill();

                //determine how long lazer triangle is visible
                if (towerAttack.timeFired == 0) {
                    towerAttack.timeFired = Date.now();
                } else {
                    //if time drawn is passed delete the object
                    if (towerAttack.timeFired+200 - Date.now()<0) {   
                        _this.towerAttacks[key] =null;
                        delete _this.towerAttacks[key];
                    }
                }

            }

        }
        
        // draw control points for each control point check it is controled by a team and change its color then draw it
        for (const key in controlPoints) {
            controlPoint = controlPoints[key];
            chooseColor(controlPoint.team);
            context.beginPath();
            const spikeSize = 5;
            context.moveTo(controlPoint.x-camera.xOffset-spikeSize,  controlPoint.y-camera.yOffset+(controlPoint.height/2));
            context.lineTo(controlPoint.x-camera.xOffset+(controlPoint.width/2),  controlPoint.y-camera.yOffset+controlPoint.height+spikeSize);
            context.lineTo(controlPoint.x-camera.xOffset+controlPoint.width+spikeSize,  controlPoint.y-camera.yOffset+(controlPoint.height/2));
            context.lineTo(controlPoint.x-camera.xOffset+(controlPoint.width/2),  controlPoint.y-camera.yOffset-spikeSize);
            context.fill();
            context.fillRect(controlPoint.x-camera.xOffset, controlPoint.y-camera.yOffset, controlPoint.width, controlPoint.height);
            //  draw progress bar for control points
            chooseColor(controlPoint.conqueringTeam);
            context.fillRect(controlPoint.x-camera.xOffset , controlPoint.y-10-camera.yOffset, (controlPoint.width/10)*(controlPoint.points), 5);
            
        }
        // draw control points for each control point check it is controled by a team and change its color then draw it
        for (const key in minionsFactories) {
            minionsFactory = minionsFactories[key];
            chooseColor(minionsFactory.team);
            context.fillRect(minionsFactory.x-camera.xOffset, minionsFactory.y-camera.yOffset, minionsFactory.width, minionsFactory.height);
            //  draw progress bar for control points
            chooseColor(minionsFactory.conqueringTeam);
            context.fillRect(minionsFactory.x-camera.xOffset , minionsFactory.y-10-camera.yOffset, (minionsFactory.width/10)*(minionsFactory.points), 5);
        }
        //draw areas off effect of boss and control points
        drawCircleStroke(bosses, false);
        drawPointsCircleStroke(minionsFactories, false);
        drawCircleStroke(myCharacter, true);
        
        drawCircleStroke(spawnAreas, false);
        

        // Draw each player with the apropriate team color
        drawCircles(players, true)
        //Draw Bullets
        drawCircles(bullets, false)
        //Draw Minions
        drawCircles(minions, false)
        //Draw Bosses
        drawCircles(bosses, false);
        
    
        
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

        //Draw User Interface
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

        drawUiTeamChooser();
        
        
        


    },  1000 / 60);
    
    /**
     * - Listen for world Objects update
     **/
    socket.on('world', function (objs , factories, tp, hp, b, sa) {
        controlPoints = objs;
        minionsFactories = factories
        teamPoints = (tp === undefined) ? teamPoints : tp;
        healthPacks = hp;
        bosses = b;
        spawnAreas= sa;
        
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
    
    socket.on('gameOver', function() {

        _this.camera = {};
        _this.movement = {};
        _this.players = {};
        _this.bullets = {};
        _this.minions = {};
        _this.bosses = {};
        _this.myCharacter = {};                   
        _this.controlPoints = {};
        _this.teamPoints = {};
        _this.healthPacks = {};                   



        delete _this.camera;
        delete _this.movement;
        delete _this.players;
        delete _this.bullets;
        delete _this.minions;
        delete _this.bosses;
        delete _this.myCharacter;                   
        delete _this.controlPoints;
        delete _this.teamPoints;
        delete _this.healthPacks;                   
             
        
    });

}else{
    clearInterval(sendInputToServer);
    clearInterval(getObjectsFromServer);
}   
function drawUiTeamChooser(){
    let distance;
    if (spawnAreas.length > 0) {
    
        if (myCharacter.team == 1) {
            const dx = myCharacter.x - spawnAreas[0].x;
            const dy = myCharacter.y -spawnAreas[0].y;
            distance = Math.sqrt(dx * dx + dy * dy);                 
        } else if (myCharacter.team == 2)  {                
            const dx = myCharacter.x - spawnAreas[1].x;
            const dy = myCharacter.y -spawnAreas[1].y;
            distance = Math.sqrt(dx * dx + dy * dy);                    
        }


        if (distance < spawnAreas[0].area) {
            
            
        
            context.fillStyle = 'white';
            context.fillRect(canvas.width-240, canvas.height - 110, 240, 100);
            context.strokeRect(canvas.width-240, canvas.height - 110, 240, 100);
    
            context.fillStyle = 'black';
            context.font = '14px sans-serif';
            context.fillText("press 1 to choose the Tank", canvas.width-210,  canvas.height - 90);
            context.fillText("press 2 to choose the Scout", canvas.width-210, canvas.height - 70);
            context.fillText("press 3 to choose the Shooter", canvas.width-210, canvas.height - 50);
        
            switch (myCharacter.power) {
                case 1:
                context.fillStyle = 'black';
                context.fillRect(canvas.width-230, canvas.height - 97, 10, 10);
                    break;
                case 2:
                context.fillStyle = 'black';
                context.fillRect(canvas.width-230, canvas.height - 77, 10, 10);
                    break;
                case 3:
                context.fillStyle = 'black';
                context.fillRect(canvas.width-230, canvas.height - 57, 10, 10);
                    break;
                default:
                    break;
            }
        }
    }
}

function drawBackground(){
    img = _this.backgroundImage.image;
    imgSize = _this.backgroundImage.size;
    iteration = _this.backgroundImage.iteration;
    for (let indexX = 0; indexX < iteration; indexX++) {
        for (let indexY = 0; indexY < iteration; indexY++) {
            context.drawImage(img, (imgSize*indexX)-camera.xOffset, (imgSize*indexY)-camera.yOffset);
        } 
    }
}
function drawCircleStroke(list, isplayer){
    if (isplayer) {
        context.fillStyle = 'black';
        context.lineWidth=3;

        context.beginPath();
        const x = myCharacter.x-camera.xOffset;
        const y = myCharacter.y-camera.yOffset;
        currentCooldown =(((myCharacter.powerStartCooldownTimer+myCharacter.powerCooldown)- Date.now())/myCharacter.powerCooldown);
        arc=0;
        if(currentCooldown>0){
            arc = currentCooldown*2;
        }
        
        
        context.arc(x, y, myCharacter.radius, 0, arc * Math.PI);
        context.stroke();
            
    }else{                   
        for (const key in list) {
            context.lineWidth=1;
            item = list[key];
            chooseColor(item.team);                       
            context.beginPath();
            const x = item.x-camera.xOffset;
            const y = item.y-camera.yOffset;                          
            context.arc(x, y, item.area+5, 0, 2 * Math.PI);
            context.stroke();
        }
    }
    
}
function drawPointsCircleStroke(list, isplayer){
for (const key in list) {
    item = list[key];
    chooseColor(item.team);
    context.lineWidth=1;
    
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

        if(players[item.id] != null){
            context.font = '12px mono';
            const name = players[item.id].name;

            context.fillText(name, item.x-(name.length/2)-item.radius-camera.xOffset, item.y-item.radius-13-camera.yOffset);
        }
       

        if (isplayer && item.id === myCharacter.id) {
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
}






// listen for what room we are on
socket.on('towerAttack', function (tower) {
   const newAttack= {};
   newAttack.x = tower.x;
   newAttack.y = tower.y;
   newAttack.width = tower.width;
   newAttack.height = tower.height;
   newAttack.team = tower.team;
   newAttack.timeFired = 0;
   _this.towerAttacks.push(newAttack);
});




