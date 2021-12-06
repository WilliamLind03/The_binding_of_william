"use strict";

$(document).ready(init);

var ctx, counter, gameloop, pausedGame, diagonalSpeed, bossAnimation, bossMovementInterval, damageDelay, enemiesLeft, bossAttack1Interval; 
// Images
var boostFiringspeed = new Image();
var bossBulletImage = new Image();
var characterImage = new Image();
var bossDeadImage = new Image();
var bossBatImage = new Image();
var boostDamage = new Image();
var bulletImage = new Image();
var heartImage = new Image();
var boostSpeed = new Image();
var boostRange = new Image();
var enemyImage = new Image();
// Lists
var bossStages = [PATH_BOSS_STAGE_1, PATH_BOSS_STAGE_2, PATH_BOSS_STAGE_3, PATH_BOSS_STAGE_4];
var bossBulletArray = [];
var boosterArray = [];
var bulletArray = [];
var enemyArray = [];
var heartArray = [];
// Game values                 ___
var enemyAmount = 10; //      (o_o)
var playerHealth = 6; //        |
var damage = 1; //             /|\
var score = 0; //            _/ | \_
var level = 1; //              / \
// Positions                 _/   \_
var currentScreenX = SCREEN_CHARACTER_X;
var currentScreenY = SCREEN_CHARACTER_Y;
var bossBatPosX = BOSS_BAT_X;
var bossBatPosY = BOSS_BAT_Y;
// Spritesheet positions
var currentSpriteX = SPRITE_START_X;
var currentSpriteY = SPRITE_START_EAST_Y;
var currentEnemyX = SPRITE_START_X;
var currentEnemyY = SPRITE_START_EAST_Y;
var bossBatSpriteX = 0;
// Booleans 
var backgroundSoundStarted = false;
var shootingEnabled = true;
var attack1Started = false;
var isMovingNorth = false;
var isMovingSouth = false;
var isMovingEast = false;
var isMovingWest = false;
var canTakeDamage = true;
var gamePaused = false;
var isGameover = false;
var bossKilled = true;
var isMoving = false;
var goRight = true;
// Sounds
var backgroundSound = new sound("sound/frogs3.mp3", true);
var hitSound = new sound("sound/hit.wav", false);

var bossBulletAmount = BOSS_BULLET_AMOUNT;
var playerSpeed = SCREEN_CHARACTER_SPEED;
var shootingDelay = SHOOTING_DELAY;
var shootingRange = SHOOTING_RANGE;
var bossMaxHealth = BOSS_HEALTH;
var bossSpeed = BOSS_BAT_SPEED;
var bulletSpeed = BULLET_SPEED;
var bossHealth = BOSS_HEALTH;
var currentBossStage = 0;
var enemyFacing = SOUTH;
var facing = SOUTH;




function init(){
    enemiesLeft = enemyAmount;
    ctx = $("#gameCanvas")[0].getContext("2d");  
    $('body').css('margin', '0');  //No margins
    $('body').css('overflow', 'hidden'); //Hide scrollbars
    $('body').css('backgroundImage', 'radial-gradient(#333, #222, #111)');
    ctx.canvas.width  = $(window).width();
    ctx.canvas.height = $(window).height();	
    characterImage.src = PATH_CHARACTER;
    enemyImage.src = PATH_ENEMY;
    bulletImage.src = PATH_BULLET;
    heartImage.src = PATH_HEART;
    bossBatImage.src = bossStages[currentBossStage];
    bossDeadImage.src = PATH_BOSS_DEAD;
    bossBulletImage.src = PATH_BOSS_BULLET;
    
    boostSpeed.src = PATH_BOOST_SPEED;
    boostFiringspeed.src = PATH_BOOST_FIRINGSPEED
    boostRange.src = PATH_BOOST_RANGE;
    boostDamage.src = PATH_BOOST_DAMAGE;
    
    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);
    gameloop = setInterval(loop, TIME_PER_FRAME);
    spawnEnemies();
}

//Game Loop
function loop(){
    ctx.font = GAME_FONT;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    ctx.fillStyle = GAME_FONT_COLOR;
    
    ctx.textAlign = "left";
    ctx.fillText("Damage: " + damage, COUNTER_X, COUNTER_Y);
    ctx.fillText("Firerate: " + (shootingDelay/1000) + "s", COUNTER_X, COUNTER_Y + 30);
    ctx.fillText("Range: " + shootingRange, COUNTER_X, COUNTER_Y + 60);
    ctx.fillText("Speed: " + (Math.round(playerSpeed * 100)/100), COUNTER_X, COUNTER_Y + 90);
    ctx.fillText("Kills: " + score, COUNTER_X, COUNTER_Y + 120);
    ctx.fillText(("Move: wasd"), 20, ctx.canvas.height - 40);
    ctx.fillText(("Shoot: arrows"), 20, ctx.canvas.height - 20);
    ctx.textAlign = "center";
    ctx.fillStyle = "#222";
    ctx.font = "bold 50px sans-serif";
    ctx.fillText(("level"), LEVEL_X, LEVEL_Y);
    ctx.font = "bold 120px sans-serif";

    
    ctx.fillText(level, LEVEL_X, LEVEL_Y + 110);
        
    if (level % BOSS_SPAWN_LVL == 0) {
        ctx.fillStyle = "red";
        ctx.font = "bold 80px sans-serif";
        ctx.fillText("BOSS", (ctx.canvas.width/2), 80);
        drawBoss();
        bossMovement();
    }
    
    
    if (currentScreenX < 0){
        currentScreenX = 0;
    } else if (currentScreenX > (ctx.canvas.width - 72)){
        currentScreenX = (ctx.canvas.width - 72);
    }
    if (currentScreenY < 0){
        currentScreenY = 0;
    } else if (currentScreenY > ctx.canvas.height - 96){
        currentScreenY = ctx.canvas.height - 96;
    }
    
    drawBooster();
    drawCharacter();
    enemyMovement();
    drawBullet();
    drawBossAttack1()
    enemyCollision();
    drawHearts();

    if(playerHealth == 0){
        gameover();
    }
}

// Player rendering/movement
function drawCharacter(){
    if (isMovingNorth || isMovingEast || isMovingSouth || isMovingWest) 
    {
        if (facing == NORTH) 
        {           
            currentSpriteY = SPRITE_START_NORTH_Y;
        }
        if (facing == EAST) 
        {
            currentSpriteY = SPRITE_START_EAST_Y;
        }
        if (facing == SOUTH) 
        {
            currentSpriteY = SPRITE_START_SOUTH_Y;
        }
        if (facing == WEST) 
        {
            currentSpriteY = SPRITE_START_WEST_Y;
            
        }
        
        
        if(isMovingNorth && isMovingEast){
            diagonalSpeed = playerSpeed * Math.sin(45);
            currentScreenY -= diagonalSpeed;
            currentScreenX += diagonalSpeed;
            currentSpriteY = SPRITE_START_EAST_Y;
        }
        else if(isMovingNorth && isMovingWest){
            diagonalSpeed = playerSpeed * Math.sin(45);
            currentScreenY -= diagonalSpeed;
            currentScreenX -= diagonalSpeed;
            currentSpriteY = SPRITE_START_WEST_Y;
        }
        else if(isMovingSouth && isMovingEast){
            diagonalSpeed = playerSpeed * Math.sin(45);
            currentScreenY += diagonalSpeed;
            currentScreenX += diagonalSpeed;
            currentSpriteY = SPRITE_START_EAST_Y;
        }
        else if(isMovingSouth && isMovingWest){
            diagonalSpeed = playerSpeed * Math.sin(45);
            currentScreenY += diagonalSpeed;
            currentScreenX -= diagonalSpeed;
            currentSpriteY = SPRITE_START_WEST_Y;
        } else {
            if(isMovingNorth){
                currentScreenY -= playerSpeed;
                currentSpriteY = SPRITE_START_NORTH_Y;
            }
            if(isMovingEast){
                currentScreenX += playerSpeed;
                currentSpriteY = SPRITE_START_EAST_Y;
            }
            if(isMovingSouth){
                currentScreenY += playerSpeed;
                currentSpriteY = SPRITE_START_SOUTH_Y;
            }
            if(isMovingWest){
                currentScreenX -= playerSpeed;
                currentSpriteY = SPRITE_START_WEST_Y;
            }
        }
        

        currentSpriteX += CHARACTER_WIDTH;
        if (currentSpriteX >= SPRITE_WIDTH) 
        {
            currentSpriteX = SPRITE_START_X;
        }
        
    }
  
  //Draw Image from sprite to screen
    ctx.drawImage(characterImage, currentSpriteX, currentSpriteY, CHARACTER_WIDTH, CHARACTER_HEIGHT,  //From sprite
                currentScreenX, currentScreenY, CHARACTER_WIDTH, CHARACTER_HEIGHT);  //To screen
}

function drawEnemy(){

    for(var i = 0; i < enemyArray.length; i++){
        if (enemyArray[i].facing == NORTH) 
        {
            enemyArray[i].spriteY = SPRITE_START_NORTH_Y;
        }
        if (enemyArray[i].facing == EAST) 
        {
            enemyArray[i].spriteY = SPRITE_START_WEST_Y;
        }
        if (enemyArray[i].facing == SOUTH) 
        {
            enemyArray[i].spriteY = SPRITE_START_SOUTH_Y;
        }
        if (enemyArray[i].facing == WEST) 
        {
            enemyArray[i].spriteY = SPRITE_START_EAST_Y;
        }


        currentEnemyX += CHARACTER_WIDTH;
        if (currentEnemyX >= SPRITE_WIDTH) 
        {
            currentEnemyX = SPRITE_START_X;
        }

        //Draw Image from sprite to screen
        ctx.drawImage(enemyImage, currentEnemyX, enemyArray[i].spriteY, CHARACTER_WIDTH, CHARACTER_HEIGHT,  //From sprite
                enemyArray[i].x, enemyArray[i].y, CHARACTER_WIDTH, CHARACTER_HEIGHT);                 //To screen    
    }
  
}

function spawnEnemies(){
    for (var i = 0; i < enemyAmount; i++){
        var enemy = new Object();
        enemy.x = (Math.random() * (ctx.canvas.width * 2)) - (ctx.canvas.width / 2);
        if (enemy.x >= (-71) && enemy.x <= (ctx.canvas.width)){
            if ((Math.random() * 2) >= 1){
                enemy.y = Math.random() * -(ctx.canvas.height / 2) - 71;
            }
            else{
                enemy.y = Math.random() * (ctx.canvas.height / 2) + ctx.canvas.height;
            }
        }
        else{
            
            enemy.y = Math.random() * ctx.canvas.height;
        }
        
        enemy.speed = (Math.random() * (ENEMY_MAX_SPEED - ENEMY_MIN_SPEED)) + ENEMY_MIN_SPEED;
        enemy.spriteY;
        enemy.HP = ENEMY_HP;
        enemy.facing = SOUTH;
        enemyArray.push(enemy);
        
    }
}

function enemyMovement(){
    
    for(var i = enemyArray.length - 1; i >= 0; i--){
        // Moves enemy towards player
        var differenceX = currentScreenX - enemyArray[i].x;
        var differenceY = currentScreenY - enemyArray[i].y;
        var hypotenuse = Math.pow((Math.pow(differenceX, 2) + Math.pow(differenceY, 2)), 0.5);
        enemyArray[i].x += enemyArray[i].speed * (differenceX / hypotenuse);
        enemyArray[i].y += enemyArray[i].speed * (differenceY / hypotenuse);
        
        
        // Faces enemies towards the player
        if(differenceY < 0 && Math.abs(differenceX) < Math.abs(differenceY)){
            enemyArray[i].facing = NORTH;
        }
        else if(differenceY > 0 && Math.abs(differenceX) < Math.abs(differenceY)){
            enemyArray[i].facing = SOUTH;
        }
        else if(differenceX > 0 && Math.abs(differenceY) < Math.abs(differenceX)){
            enemyArray[i].facing = WEST;
        }
        else if(differenceX < 0 && Math.abs(differenceY) < Math.abs(differenceX)){
            enemyArray[i].facing = EAST;
        }
        
    }
    drawEnemy();
}

function enemyCollision(){
    for(var i = enemyArray.length - 1; i >= 0; i--){
        if(collisionDetection(enemyArray[i].x + HITBOX_PLAYER_X, enemyArray[i].y + HITBOX_PLAYER_Y, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT, currentScreenX + HITBOX_PLAYER_X, currentScreenY + HITBOX_PLAYER_Y, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT))
        {
            takeDamage();
        }
    }
}

// Draw bullet and enemy collision
function drawBullet(){
    for(var i = bulletArray.length - 1; i >= 0; i--)
    {
        // Bullet movement
        if(bulletArray[i].direction == NORTH){
            bulletArray[i].y -= bulletSpeed;
        } else if(bulletArray[i].direction == EAST){
            bulletArray[i].x += bulletSpeed;
        } else if(bulletArray[i].direction == SOUTH){
            bulletArray[i].y += bulletSpeed;
        } else if(bulletArray[i].direction == WEST){
            bulletArray[i].x -= bulletSpeed;
        }
        
        // Adding directional movement
        if(bulletArray[i].directionSpeed == NORTH){
            bulletArray[i].y -= BULLET_DIRECTION_SPEED;
        } else if(bulletArray[i].directionSpeed == EAST){
            bulletArray[i].x += BULLET_DIRECTION_SPEED;
        } else if(bulletArray[i].directionSpeed == SOUTH){
            bulletArray[i].y += BULLET_DIRECTION_SPEED;
        } else if(bulletArray[i].directionSpeed == WEST){
            bulletArray[i].x -= BULLET_DIRECTION_SPEED;
        }
        
        ctx.drawImage(bulletImage, bulletArray[i].x, bulletArray[i].y);
        
        if(bulletArray[i].y > ctx.canvas.height || bulletArray[i].y < -BULLET_HEIGHT || bulletArray[i].x < -BULLET_WIDTH ||  bulletArray[i].x > ctx.canvas.width)
        {
            bulletArray.splice(i, 1);
        }
        
        bulletRangeFunc(i);
        for(var j = enemyArray.length - 1; j >= 0; j--){
            if(bulletArray[i] && enemyArray[j]){
                if(collisionDetection(enemyArray[j].x + HITBOX_PLAYER_X, enemyArray[j].y + HITBOX_PLAYER_Y/2, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT/2, bulletArray[i].x, bulletArray[i].y, BULLET_WIDTH, BULLET_HEIGHT)){
                    bulletArray.splice(i, 1);
                    enemyArray[j].HP -= damage;
                    if(enemyArray[j].HP <= 0){
                        spawnBooster(j);
                        enemyArray.splice(j, 1);
                        score++;
                        enemiesLeft--;
                        if(enemiesLeft == 0){
                            nextLevel();
                        }
                    }
                }
            }
        }
    }
}

function shoot(direction){
    if(shootingEnabled){
        var newBullet = new Object();
        newBullet.x = currentScreenX + (CHARACTER_WIDTH / 2) - (BULLET_WIDTH / 2);
        newBullet.y = currentScreenY + (CHARACTER_HEIGHT / 2) + (BULLET_HEIGHT / 2);
        newBullet.startX = newBullet.x;
        newBullet.startY = newBullet.y;
        newBullet.direction = direction;
        if (isMovingNorth || isMovingEast || isMovingSouth || isMovingWest){
            if (isMovingNorth){
                newBullet.directionSpeed = NORTH;
            }
            else if (isMovingEast){
                newBullet.directionSpeed = EAST;
            }
            else if (isMovingSouth){
                newBullet.directionSpeed = SOUTH;
            }
            else if (isMovingWest){
                newBullet.directionSpeed = WEST;
            }

        }
        bulletArray.push(newBullet);
        shootingEnabled = false;
        var shootingInterval = setTimeout(shootingDelayFunc, shootingDelay);
    }
    
}

function bulletRangeFunc(i){
    // Removes bullet after given range
    if(bulletArray[i]){
        if((Math.abs(bulletArray[i].startX - bulletArray[i].x) > shootingRange) || (Math.abs(bulletArray[i].startY - bulletArray[i].y) > shootingRange)){
            bulletArray.splice(i, 1);
        }
    }
}

function nextLevel(){
    level++;
    if(level % 5 == 0){
        enemyAmount++;
    }
    enemiesLeft = enemyAmount;
    if (level % BOSS_SPAWN_LVL != 0){
        spawnEnemies();
    }
}

function takeDamage(){
    if(canTakeDamage){
        canTakeDamage = false;
        playerHealth--;
        damageDelay = setTimeout(takeDamageDelay, 500);
    }  
        
}

function takeDamageDelay(){
    canTakeDamage = true;
}

// Draws boss
function drawBoss(){
    
    bossHealthbar();
    bossCollision();
    
    // Attack interval
    if(attack1Started == false){
        bossAttack1Interval = setInterval(bossAttack1, 1200 - (300 * currentBossStage));
        attack1Started = true;
    }

    // Draws boss alive
    if(bossHealth > 0){
        // Updates boss sprite
        bossBatSpriteX += BOSS_BAT_WIDTH;
        if (bossBatSpriteX >= BOSS_BAT_SPRITE_WIDTH){
            bossBatSpriteX = SPRITE_START_X;
        }
        
        ctx.drawImage(bossBatImage, bossBatSpriteX, 0, BOSS_BAT_WIDTH, BOSS_BAT_HEIGHT, bossBatPosX, bossBatPosY, BOSS_BAT_WIDTH, BOSS_BAT_HEIGHT);
    } 
    // Draws boss dead
    else {
        ctx.drawImage(bossDeadImage, bossBatPosX, bossBatPosY);
    }
    
}

// Boss Movement
function bossMovement(){
    
    // Goes right
    if(((bossBatPosX + (BOSS_BAT_WIDTH/2)) <= (ctx.canvas.width + 400)) && goRight == true) {
       bossBatPosX += bossSpeed;
    }
    // Turns
    if (((bossBatPosX + (BOSS_BAT_WIDTH/2)) > (ctx.canvas.width + 400)) && goRight == true){
        goRight = false;
        bossBatPosY = currentScreenY - (BOSS_BAT_HEIGHT/2) + (CHARACTER_HEIGHT/2); // Gives boss same Y-value as player
    }
    // Goes left
    if(((bossBatPosX + (BOSS_BAT_WIDTH/2)) >= -400) && goRight == false) {
       bossBatPosX -= bossSpeed;
    }
    // Turns
    if (((bossBatPosX + (BOSS_BAT_WIDTH/2)) < -400) && goRight == false){
        goRight = true;
        bossBatPosY = currentScreenY - (BOSS_BAT_HEIGHT/2) + (CHARACTER_HEIGHT/2); // Gives boss same Y-value as player
    }
    // Goes faster the lower the health
    if(bossHealth > 0){
        bossSpeed = BOSS_BAT_SPEED * (2 - (bossHealth/bossMaxHealth));
    }
    
}

function bossCollision(){
    
    // Collision with player
    if(collisionDetection(bossBatPosX + 140, bossBatPosY + 140, BOSS_BAT_WIDTH -280, BOSS_BAT_HEIGHT -290, currentScreenX + HITBOX_PLAYER_X, currentScreenY + HITBOX_PLAYER_Y, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT) && bossHealth > 0){
        takeDamage();
    }
    
    // Collision with bullet
    for(var i = bulletArray.length - 1; i >= 0; i--){
        if(collisionDetection(bossBatPosX + 140, bossBatPosY + 140, BOSS_BAT_WIDTH -280, BOSS_BAT_HEIGHT -290, bulletArray[i].x, bulletArray[i].y, BULLET_WIDTH, BULLET_HEIGHT)){
            bulletArray.splice(i, 1);
            if(bossHealth > 0){
                bossHealth -= damage;
            }
            
        }
    }
    
    // Checks if boss is dead
    if(bossHealth <= 0){
        clearInterval(bossAttack1Interval);
        bossHealth = 0;
        // Slows boss down
        if(bossSpeed > 0){
            bossSpeed -= 1;
            bossBatPosY += 3;
        }
        else if (bossSpeed <= 0){
            bossSpeed = 0;
            if(bossKilled){
                console.log("reset");
                var reset = setTimeout(resetBoss, 2000);
                bossKilled = false;
            }
            
        }
        
    }
    
}

function bossAttack1(){
    // Creates bullets
    for(var i = 0; i < bossBulletAmount; i++){
        var bossBullet = new Object();
        var randInt = Math.random() * 360;
        bossBullet.speedX = BOSS_BULLET_SPEED * Math.cos(randInt);
        bossBullet.speedY = BOSS_BULLET_SPEED * Math.sin(randInt);
        bossBullet.x = bossBatPosX + (BOSS_BAT_WIDTH/2);
        bossBullet.y = bossBatPosY + (BOSS_BAT_HEIGHT/2);
        bossBulletArray.push(bossBullet)
    }
}

function drawBossAttack1(){
    
    bossAttack1Collision();
    
    for(var i = bossBulletArray.length - 1; i >= 0; i--){
        console.log(bossBulletArray[i].speed);
        bossBulletArray[i].x += bossBulletArray[i].speedX;
        bossBulletArray[i].y += bossBulletArray[i].speedY;
        
        // draws boss bullets
        ctx.drawImage(bossBulletImage, bossBulletArray[i].x, bossBulletArray[i].y);
        
        // Removes if outside of screen
        if(bossBulletArray[i].x < -400 || bossBulletArray[i].x > ctx.canvas.width + 400 || bossBulletArray[i].y < BULLET_HEIGHT || bossBulletArray[i].y > ctx.canvas.height){
            bossBulletArray.splice(i, 1);
        } 
    }
}

function bossAttack1Collision(){
    // Checks collision with player
    for(var i = bossBulletArray.length - 1; i >= 0; i--){
        if(bossBulletArray[i]){
            if(collisionDetection(bossBulletArray[i].x, bossBulletArray[i].y, BULLET_WIDTH, BULLET_HEIGHT, currentScreenX + HITBOX_PLAYER_X, currentScreenY + HITBOX_PLAYER_Y, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT)){
                takeDamage();
            }
        }
        
    }
}

// Resets boss values
function resetBoss(){
    nextLevel();
    bossSpeed = BOSS_BAT_SPEED + (level / BOSS_SPAWN_LVL);
    bossMaxHealth = Math.floor(bossMaxHealth + bossMaxHealth * 0.5);
    bossHealth = bossMaxHealth
    bossBatPosX = BOSS_BAT_X;
    bossBatPosY = BOSS_BAT_Y;
    attack1Started = false;
    if(currentBossStage < 3){
        currentBossStage++;
    }
    bossBatImage.src = bossStages[currentBossStage];
    bossKilled = true;
}

function bossHealthbar(){
    // Healthbar background
    ctx.fillStyle = "black";
    ctx.fillRect(BOSS_HEALTHBAR_X - 3, BOSS_HEALTHBAR_Y - 3, BOSS_HEALTHBAR_WIDTH + 6, BOSS_HEALTHBAR_HEIGHT + 6);
    
    // Health
    ctx.fillStyle = "red";
    ctx.fillRect(BOSS_HEALTHBAR_X, BOSS_HEALTHBAR_Y, ((BOSS_HEALTHBAR_WIDTH / bossMaxHealth) * bossHealth), BOSS_HEALTHBAR_HEIGHT);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(bossHealth, (ctx.canvas.width/2), BOSS_HEALTHBAR_Y + 20);
    
}

function keyDownHandler(event){
    if (event.keyCode == W) 
    {
        facing = NORTH;
        isMovingNorth = true;
        isMoving = true;
    }
    if (event.keyCode == D) 
    {
        facing = EAST;
        isMovingEast = true;
        isMoving = true;
    }
    if (event.keyCode == S) 
    {
        facing = SOUTH;
        isMovingSouth = true;
        isMoving = true;
    }
    if (event.keyCode == A) 
    {
        facing = WEST;
        isMovingWest = true;
        isMoving = true;
    }
    
    
    if (backgroundSoundStarted == false){
        //backgroundSound.play();
        backgroundSoundStarted = true;
    }
    
    if (event.keyCode == ARROW_UP) 
    {
        shoot(NORTH);
    }
    if (event.keyCode == ARROW_RIGHT) 
    {
        shoot(EAST);
    }
    if (event.keyCode == ARROW_DOWN) 
    {
        shoot(SOUTH);
    }
    if (event.keyCode == ARROW_LEFT) 
    {
        shoot(WEST);
    }
    
    if (event.keyCode == SPACE && isGameover) 
    {
        document.location.reload(true);
    }
    
    
    // Pauses game
    if (event.keyCode == ESC || event.keyCode == SPACE){
        if(gamePaused == false && (isGameover == false)){
            pauseGame();
        }
        else if (gamePaused){
            resumeGame();
        } 
        
    }
}

function keyUpHandler(event){
    if(event.keyCode == W){
        isMovingNorth = false;
    }
    if(event.keyCode == S){
        isMovingSouth = false;
    }
    if(event.keyCode == A){
        isMovingWest = false;
    }
    if(event.keyCode == D){
        isMovingEast = false;
    }
}

function pauseGame(){
    clearInterval(gameloop);
    clearInterval(bossAttack1Interval);
    attack1Started = false;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "white";
    ctx.fillText("GAME PAUSED", ctx.canvas.width / 2, (ctx.canvas.height / 2) - 100);
    gamePaused = true;
}
function resumeGame(){
    gameloop = setInterval(loop, TIME_PER_FRAME);
    gamePaused = false;
}

//Check for collisions - Returns true if the rectangles collides, otherwise false
function collisionDetection(x1, y1, w1, h1, x2, y2, w2, h2){
  //x1, y1 = x and y coordinates of rectangle 1
  //w1, h1 = width and height of rectangle 1
  //x2, y2 = x and y coordinates of rectangle 2
  //w2, h2 = width and height of rectangle 2
  /*
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.rect(x1,y1,w1,h1);
  ctx.rect(x2,y2,w2,h2);
  ctx.stroke();
  */
  if (x1 <= x2+w2 && x2 <= x1+w1 && y1 <= y2+h2 && y2 <= y1+h1)
  {
	return true;
  }
  else 
    return false;
}

function drawHearts(){
    for(var i = 1; i <= playerHealth; i++){
        
        if (i < 7){ // First row of hearts
            var heartX = HEART_FIRST_POS_X + (HEART_WIDTH + HEART_DISTANCE_BETWEEN) * i;
            var heartY = HEART_POS_Y;
        } else { // Seconds row of hearts
            heartX = HEART_FIRST_POS_X + (HEART_WIDTH + HEART_DISTANCE_BETWEEN) * (i-6) 
            heartY = HEART_POS_Y + HEART_WIDTH;
        }
        ctx.drawImage(heartImage, heartX, heartY);
    }
}

//Sound function
function sound(src, loop){
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  if (loop)
    this.sound.setAttribute("loop", true);
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() 
  {
	this.sound.play();
  }
  this.stop = function() 
  {
	this.sound.pause();
  }
}

// Shooting delay function
function shootingDelayFunc(){
    shootingEnabled = true;
}

function spawnBooster(j){
    if(Math.random() < 0.2){
       var booster = new Object();
        booster.x = enemyArray[j].x + ((CHARACTER_WIDTH - BOOSTER_WIDTH) / 2);
        booster.y = enemyArray[j].y + (CHARACTER_HEIGHT - BOOSTER_HEIGHT);
        booster.magnetForce = BOOSTER_MAGNETFORCE;
        var randomBooster = Math.floor(Math.random() * 4);
        if(randomBooster == 0){
            booster.img = boostSpeed;
        } else if (randomBooster == 1){
            booster.img = boostFiringspeed;
        } else if (randomBooster == 2){
            booster.img = boostRange;
        } else if (randomBooster == 3){
            booster.img = boostDamage;
        }
        boosterArray.push(booster);
    } 
}

function drawBooster(){
    for(var i = boosterArray.length - 1; i >= 0; i--){
        
        var differenceX = currentScreenX + (CHARACTER_WIDTH / 2) - boosterArray[i].x - (BOOSTER_WIDTH / 2);
        var differenceY = currentScreenY + (CHARACTER_HEIGHT / 2) - boosterArray[i].y - (BOOSTER_HEIGHT / 2);
        
        if((Math.abs(differenceX) < BOOSTER_MAGNETFORCE_RANGE) && (Math.abs(differenceY) < BOOSTER_MAGNETFORCE_RANGE)){
           var hypotenuse = Math.pow((Math.pow(differenceX, 2) + Math.pow(differenceY, 2)), 0.5);
            boosterArray[i].x += boosterArray[i].magnetForce * (differenceX / hypotenuse);
            boosterArray[i].y += boosterArray[i].magnetForce * (differenceY / hypotenuse);
        }
        
        ctx.drawImage(boosterArray[i].img, boosterArray[i].x, boosterArray[i].y);
    }
    boosterCollision();
}

function boosterCollision(){
    
    for(var i = boosterArray.length - 1; i >= 0; i--){
        if(collisionDetection(boosterArray[i].x, boosterArray[i].y, BOOSTER_WIDTH , BOOSTER_HEIGHT, currentScreenX + HITBOX_PLAYER_X, currentScreenY + HITBOX_PLAYER_Y, CHARACTER_WIDTH - HITBOX_PLAYER_WIDTH, CHARACTER_HEIGHT - HITBOX_PLAYER_HEIGHT)){
            if(boosterArray[i].img == boostSpeed){
                if(playerSpeed < 15){
                   playerSpeed += 0.2;
                }
                
                boosterArray.splice(i, 1);
                console.log("more speed!");
            } else if(boosterArray[i].img == boostFiringspeed){
                if(shootingDelay > 100){
                    shootingDelay -= 20;
                }
                boosterArray.splice(i, 1);
            } else if(boosterArray[i].img == boostRange){
                shootingRange += 100;
                boosterArray.splice(i, 1);
            } else if(boosterArray[i].img == boostDamage){
                damage += 1;
                boosterArray.splice(i, 1);
            }
        }
    }
    
}

function gameover(){
    // Stops game loop
    clearInterval(gameloop);
    isGameover = true;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.font = "bold 200px sans-serif";
    ctx.fillText("GAME OVER", (ctx.canvas.width / 2), (ctx.canvas.height / 2) - 100);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("PRESS SPACE TO PLAY AGAIN", (ctx.canvas.width / 2), (ctx.canvas.height / 2) + 200);
}