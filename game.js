
"use strict";

$(document).ready(init);

var scalefX = $(window).width() / 1920;
var scalefY = $(window).height() / 969;

var ctx, counter, gameloop, pausedGame, diagonalSpeed, bossAnimation, bossMovementInterval, damageDelay, enemiesLeft, bossAttackInterval; 
// Images
var boostFiringspeed = new Image();
var bossBulletImage = new Image();
var characterImage = new Image();
var bossDeadImage = new Image();
var boostDamage = new Image();
var bulletImage = new Image();
var heartImage = new Image();
var boostSpeed = new Image();
var boostRange = new Image();
var enemyImage = new Image();
var bossImage = new Image();
// Lists
var bossStages = [PATH_BOSS_STAGE_1, PATH_BOSS_STAGE_2, PATH_BOSS_STAGE_3, PATH_BOSS_STAGE_4];
var bossBulletArray = [];
var boosterArray = [];
var bulletArray = [];
var enemyArray = [];
var heartArray = [];
// Game values
var enemyAmount = 10;
var playerHealth = 6;
var damage = 1;
var score = 0;
var level = 1;
// Positions
var playerScreenX = SCREEN_CHARACTER_X;
var playerScreenY = SCREEN_CHARACTER_Y;
var bossPosX;
var bossPosY;
// Spritesheet positions
var playerSpriteX = SPRITE_START_X;
var playerSpriteY = SPRITE_START_EAST_Y;
var enemyScreenX = SPRITE_START_X;
var enemyScreenY = SPRITE_START_EAST_Y;
var bossSpriteX = 0;
// Booleans 
var backgroundSoundStarted = false;
var bossSpawnSoundPlayed = false;
var shootingEnabled = true;
var attack1Started = false;
var isMovingNorth = false;
var isMovingSouth = false;
var isMovingEast = false;
var isMovingWest = false;
var canTakeDamage = true;
var showHitboxes = false;
var gamePaused = false;
var isGameover = false;
var bossKilled = true;
var bossGoRight = true;
// Sounds
var bossBackgroundSound = new sound("sound/boss_background.mp3", true);
var bossSpawnSound = new sound("sound/boss_spawn.mp3", false);

var playerWidth = CHARACTER_WIDTH * scalefX;
var playerHeight = CHARACTER_HEIGHT * scalefY;
var bulletWidth = BULLET_WIDTH * scalefX;
var bulletHeight = BULLET_HEIGHT * scalefY;
var enemyMaxSpeed = ENEMY_MAX_SPEED * ((scalefX + scalefY) / 2);
var enemyMinSpeed = ENEMY_MIN_SPEED * ((scalefX + scalefY) / 2);
var heartWidth = HEART_WIDTH * scalefX;
var heartHeight = HEART_WIDTH * scalefY;
var playerSpeed = SCREEN_CHARACTER_SPEED * ((scalefX + scalefY) / 2);

var bossBulletAmount = BOSS_BULLET_AMOUNT;
var shootingDelay = SHOOTING_DELAY;
var shootingRange = SHOOTING_RANGE;
var bossMaxHealth = BOSS_HEALTH;
var bossSpeed = BOSS_SPEED;
var bulletSpeed = BULLET_SPEED;
var bossHealth = BOSS_HEALTH;
var currentBossStage = 0;
var enemyFacing = SOUTH;
var facing = SOUTH;


function init(){
    enemiesLeft = enemyAmount;
    ctx = $("#gameCanvas")[0].getContext("2d");  
    $('body').css('margin', '0'); //No margins
    $('body').css('overflow', 'hidden'); //Hide scrollbars
    $('body').css('backgroundImage', 'radial-gradient(#333, #222, #111)');
    ctx.canvas.width = $(window).width();
    ctx.canvas.height = $(window).height();	
    
    $(window).resize(setCanvas);
    setCanvas();
    
    // Loads images
    characterImage.src = PATH_CHARACTER;
    enemyImage.src = PATH_ENEMY;
    bulletImage.src = PATH_BULLET;
    heartImage.src = PATH_HEART;
    bossImage.src = bossStages[currentBossStage];
    bossDeadImage.src = PATH_BOSS_DEAD;
    bossBulletImage.src = PATH_BOSS_BULLET;
    boostSpeed.src = PATH_BOOST_SPEED;
    boostFiringspeed.src = PATH_BOOST_FIRINGSPEED;
    boostRange.src = PATH_BOOST_RANGE;
    boostDamage.src = PATH_BOOST_DAMAGE;
    
    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);
    gameloop = setInterval(loop, TIME_PER_FRAME);

    var bossSpawnPosX = Math.random();
    if (bossSpawnPosX > 0.5){
        bossPosX = (-400 + BOSS_WIDTH) * scalefX;
    } else {
        bossPosX = ctx.canvas.width + (400 - BOSS_WIDTH) * scalefX;
    }
    spawnEnemies();
}

//Game Loop
function loop(){
    //setCanvas();
    ctx.font = "bold " + (30 * scalefX) + "px san-serif";
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = GAME_FONT_COLOR;
    
    ctx.textAlign = "left";
    ctx.fillText("Damage: " + damage, COUNTER_X, COUNTER_Y);
    ctx.fillText("Firerate: " + Math.round(1/(shootingDelay/1000)*100)/100 + "/s", COUNTER_X, COUNTER_Y + 30);
    ctx.fillText("Range: " + shootingRange, COUNTER_X, COUNTER_Y + 60);
    ctx.fillText("Speed: " + (Math.round(playerSpeed * 100)/100), COUNTER_X, COUNTER_Y + 90);
    ctx.fillText("Kills: " + score, COUNTER_X, COUNTER_Y + 120);
    ctx.fillText((Math.floor(scalefX * 100)/100) + " - " + (Math.floor(scalefY * 100)/100), 20, ctx.canvas.height - 60);
    ctx.fillText(("Move: wasd"), 20, ctx.canvas.height - 40);
    ctx.fillText(("Shoot: arrows"), 20, ctx.canvas.height - 20);
    ctx.textAlign = "center";
    ctx.fillStyle = "#222";
    ctx.font = "bold 50px sans-serif";
    ctx.fillText(("level"), ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.font = "bold 120px sans-serif";

    
    ctx.fillText(level, ctx.canvas.width/2, ctx.canvas.height/2 + 110);
        
    // Spawns boss 
    if (level % BOSS_SPAWN_LVL == 0) {
        ctx.fillStyle = "red";
        ctx.font = "bold 80px sans-serif";
        ctx.fillText("BOSS", (ctx.canvas.width/2), 80);
        // PLays boss sounds
        if(bossSpawnSoundPlayed == false){
            console.log("should play sound now!");
            bossSpawnSound.play();
            bossBackgroundSound.play();
            bossSpawnSoundPlayed = true;
        }
        drawBoss();
        bossMovement();
    }
    
    if (playerScreenX < 0){
        playerScreenX = 0;
    } else if (playerScreenX > (ctx.canvas.width - 72)){
        playerScreenX = (ctx.canvas.width - 72);
    }
    if (playerScreenY < 0){
        playerScreenY = 0;
    } else if (playerScreenY > ctx.canvas.height - 96){
        playerScreenY = ctx.canvas.height - 96;
    }
    
    drawBooster();
    drawCharacter();
    enemyMovement();
    drawBullet();
    drawbossAttack();
    enemyCollision();
    drawHearts();
    //spawnEnemies();

    if(playerHealth == 0){
        gameover();
    }
    
    console.log(scalefX, scalefY);
}

// Player rendering/movement
function drawCharacter(){
    if (isMovingNorth || isMovingEast || isMovingSouth || isMovingWest) 
    {
        if (facing == NORTH){           
            playerSpriteY = SPRITE_START_NORTH_Y;
        }
        if (facing == EAST){
            playerSpriteY = SPRITE_START_EAST_Y;
        }
        if (facing == SOUTH){
            playerSpriteY = SPRITE_START_SOUTH_Y;
        }
        if (facing == WEST){
            playerSpriteY = SPRITE_START_WEST_Y;
        }
        
        if(isMovingNorth && isMovingEast){
            diagonalSpeed = playerSpeed * Math.sin(45);
            playerScreenY -= diagonalSpeed;
            playerScreenX += diagonalSpeed;
            playerSpriteY = SPRITE_START_EAST_Y;
        }
        else if(isMovingNorth && isMovingWest){
            diagonalSpeed = playerSpeed * Math.sin(45);
            playerScreenY -= diagonalSpeed;
            playerScreenX -= diagonalSpeed;
            playerSpriteY = SPRITE_START_WEST_Y;
        }
        else if(isMovingSouth && isMovingEast){
            diagonalSpeed = playerSpeed * Math.sin(45);
            playerScreenY += diagonalSpeed;
            playerScreenX += diagonalSpeed;
            playerSpriteY = SPRITE_START_EAST_Y;
        }
        else if(isMovingSouth && isMovingWest){
            diagonalSpeed = playerSpeed * Math.sin(45);
            playerScreenY += diagonalSpeed;
            playerScreenX -= diagonalSpeed;
            playerSpriteY = SPRITE_START_WEST_Y;
        } else {
            if(isMovingNorth){
                playerScreenY -= playerSpeed;
                playerSpriteY = SPRITE_START_NORTH_Y;
            }
            if(isMovingEast){
                playerScreenX += playerSpeed;
                playerSpriteY = SPRITE_START_EAST_Y;
            }
            if(isMovingSouth){
                playerScreenY += playerSpeed;
                playerSpriteY = SPRITE_START_SOUTH_Y;
            }
            if(isMovingWest){
                playerScreenX -= playerSpeed;
                playerSpriteY = SPRITE_START_WEST_Y;
            }
        }
        

        playerSpriteX += CHARACTER_WIDTH;
        if (playerSpriteX >= SPRITE_WIDTH) 
        {
            playerSpriteX = SPRITE_START_X;
        }
        
    }
    else {
        playerSpriteX = CHARACTER_WIDTH;
        playerSpriteY = SPRITE_START_SOUTH_Y;
    }
  
    //Draw Image from sprite to screen
    ctx.drawImage(characterImage, playerSpriteX, playerSpriteY, CHARACTER_WIDTH, CHARACTER_HEIGHT,  //From sprite
                playerScreenX, playerScreenY, playerWidth, playerHeight);  //To screen
}

// Draws enemies
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

        enemyScreenX += CHARACTER_WIDTH;
        if (enemyScreenX >= SPRITE_WIDTH) 
        {
            enemyScreenX = SPRITE_START_X;
        }

        //Draw Image from sprite to screen
        ctx.drawImage(enemyImage, enemyScreenX, enemyArray[i].spriteY, CHARACTER_WIDTH, CHARACTER_HEIGHT,  //From sprite
                enemyArray[i].x, enemyArray[i].y, playerWidth, playerHeight);                 //To screen    
    }
}

// Creates enemies
function spawnEnemies(){
    for (var i = 0; i < enemyAmount; i++){
        var enemy = new Object();
        // Gets a random position somewhere around the screen
        enemy.x = (Math.random() * (ctx.canvas.width * 2)) - (ctx.canvas.width / 2);
        if(enemy.x >= (-71) && enemy.x <= (ctx.canvas.width)){
            if((Math.random() * 2) >= 1){
                enemy.y = Math.random() * -(ctx.canvas.height / 2) - 71;
            }
            else{
                enemy.y = Math.random() * (ctx.canvas.height / 2) + ctx.canvas.height;
            }
        }
        else{
            enemy.y = Math.random() * ctx.canvas.height;
        }
        enemy.speed = (Math.random() * (enemyMaxSpeed - enemyMinSpeed)) + enemyMinSpeed;
        enemy.HP = ENEMY_HP;
        enemy.facing = SOUTH;
        enemyArray.push(enemy);
    }
}

// Enemy movement
function enemyMovement(){
    
    for(var i = enemyArray.length - 1; i >= 0; i--){
        // Moves enemy towards player
        var differenceX = playerScreenX - enemyArray[i].x;
        var differenceY = playerScreenY - enemyArray[i].y;
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

// Collision between enemy and player
function enemyCollision(){
    for(var i = enemyArray.length - 1; i >= 0; i--){
        if(collisionDetection(enemyArray[i].x + playerWidth * 0.3, enemyArray[i].y + HITBOX_PLAYER_Y * scalefY, playerWidth * 0.4, playerHeight - HITBOX_PLAYER_HEIGHT * scalefY, playerScreenX + playerWidth * 0.3, playerScreenY + HITBOX_PLAYER_Y * scalefY, playerWidth * 0.4, playerHeight - HITBOX_PLAYER_HEIGHT * scalefY))
        {
            //takeDamage();
            //enemyArray.splice(i,1);
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
        
        ctx.drawImage(bulletImage, bulletArray[i].x, bulletArray[i].y, bulletWidth, bulletHeight);
        
        if(bulletArray[i].y > ctx.canvas.height || bulletArray[i].y < -bulletHeight || bulletArray[i].x < -bulletWidth ||  bulletArray[i].x > ctx.canvas.width)
        {
            bulletArray.splice(i, 1);
        }
        
        bulletRangeFunc(i);
        for(var j = enemyArray.length - 1; j >= 0; j--){
            if(bulletArray[i] && enemyArray[j]){
                if(collisionDetection(enemyArray[j].x + playerWidth * 0.3, enemyArray[j].y + playerHeight * 0.3, playerWidth * 0.4, playerHeight * 0.6, bulletArray[i].x, bulletArray[i].y, bulletWidth, bulletHeight)){
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

// Creates bullet object
function shoot(direction){
    if(shootingEnabled){
        var newBullet = new Object();
        newBullet.x = playerScreenX + (playerWidth/ 2) - (bulletWidth / 2);
        newBullet.y = playerScreenY + (playerHeight / 2) + (bulletHeight / 2);
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

// Removes bullet after given range
function bulletRangeFunc(i){
    if(bulletArray[i]){
        if((Math.abs(bulletArray[i].startX - bulletArray[i].x) > shootingRange) || (Math.abs(bulletArray[i].startY - bulletArray[i].y) > shootingRange)){
            bulletArray.splice(i, 1);
        }
    }
}

// Moves on to next level
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

// Lowers player health
function takeDamage(){
    if(canTakeDamage){
        canTakeDamage = false;
        playerHealth--;
        damageDelay = setTimeout(takeDamageDelay, 500);
    }  
        
}

// Delay after taking damage
function takeDamageDelay(){
    canTakeDamage = true;
}

// Draws boss
function drawBoss(){
    
    bossHealthbar();
    bossCollision();
    
    // Attack interval
    if(attack1Started == false){
        bossAttackInterval = setInterval(bossAttack, 900 - (250 * currentBossStage));
        attack1Started = true;
    }

    // Draws boss alive
    if(bossHealth > 0){
        // Updates boss sprite
        bossSpriteX += BOSS_WIDTH;
        if (bossSpriteX >= BOSS_SPRITE_WIDTH){
            bossSpriteX = BOSS_SPRITE_START_X;
        }
        
        ctx.drawImage(bossImage, bossSpriteX, 0, BOSS_WIDTH, BOSS_HEIGHT, bossPosX, bossPosY, BOSS_WIDTH * scalefX, BOSS_HEIGHT * scalefY);
    } 
    // Draws boss dead
    else {
        ctx.drawImage(bossDeadImage, bossPosX, bossPosY, BOSS_WIDTH * scalefX, BOSS_HEIGHT * scalefY);
    }
    
}

// Boss Movement
function bossMovement(){
    
    // Goes right
    if(((bossPosX + (BOSS_WIDTH/2)) <= (ctx.canvas.width + 400 * scalefX)) && bossGoRight == true) {
       bossPosX += bossSpeed * scalefX;
    }
    // Turns
    if (((bossPosX + (BOSS_WIDTH/2)) > (ctx.canvas.width + 400 * scalefX)) && bossGoRight == true){
        bossGoRight = false;
        bossPosY = playerScreenY - (BOSS_HEIGHT * scalefY/2) + (playerHeight * scalefY/2); // Gives boss same Y-value as player
    }
    // Goes left
    if(((bossPosX + (BOSS_WIDTH/2)) >= -400 * scalefX) && bossGoRight == false) {
       bossPosX -= bossSpeed * scalefX;
    }
    // Turns
    if (((bossPosX + (BOSS_WIDTH/2)) < -400 * scalefX) && bossGoRight == false){
        bossGoRight = true;
        bossPosY = playerScreenY - (BOSS_HEIGHT * scalefY/2) + (playerHeight * scalefY/2); // Gives boss same Y-value as player
    }
    // Goes faster the lower the health
    if(bossHealth > 0){
        bossSpeed = BOSS_SPEED * (2 - (bossHealth/bossMaxHealth));
    }
    
}

// Checks collision with boss
function bossCollision(){
    
    // Collision with player
    if(collisionDetection(bossPosX + 140 * scalefX, bossPosY + 140 * scalefY, (BOSS_WIDTH -280) * scalefX, (BOSS_HEIGHT -290) * scalefY, playerScreenX + HITBOX_PLAYER_X * scalefX, playerScreenY + HITBOX_PLAYER_Y * scalefY, playerWidth - HITBOX_PLAYER_WIDTH * scalefX, playerHeight - HITBOX_PLAYER_HEIGHT * scalefY) && bossHealth > 0){
        takeDamage();
    }
    
    // Collision with bullet
    for(var i = bulletArray.length - 1; i >= 0; i--){
        if(collisionDetection(bossPosX + 140 * scalefX, bossPosY + 140 * scalefY, (BOSS_WIDTH -280) * scalefX, (BOSS_HEIGHT -290) * scalefY, bulletArray[i].x, bulletArray[i].y, bulletWidth, bulletHeight)){
            bulletArray.splice(i, 1);
            if(bossHealth > 0){
                bossHealth -= damage;
            }
            
        }
    }
    
    // Checks if boss is dead
    if(bossHealth <= 0){
        clearInterval(bossAttackInterval);
        bossHealth = 0;
        // Slows boss down
        if(bossSpeed > 0){
            bossSpeed -= 1;
            bossPosY += 3;
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

// Boss attack
function bossAttack(){
    // Creates bullets
    for(var i = 0; i < bossBulletAmount; i++){
        var bossBullet = new Object();
        var randInt = Math.random() * 360; // Random angle
        bossBullet.speedX = BOSS_BULLET_SPEED * Math.cos(randInt);
        bossBullet.speedY = BOSS_BULLET_SPEED * Math.sin(randInt);
        bossBullet.x = bossPosX + (BOSS_WIDTH * scalefX/2);
        bossBullet.y = bossPosY + (BOSS_HEIGHT * scalefY/2);
        bossBulletArray.push(bossBullet);
    }
}

// Draws boss attack
function drawbossAttack(){
    
    bossAttackCollision();
    
    for(var i = bossBulletArray.length - 1; i >= 0; i--){
        console.log(bossBulletArray[i].speed);
        bossBulletArray[i].x += bossBulletArray[i].speedX * scalefX;
        bossBulletArray[i].y += bossBulletArray[i].speedY * scalefY;
        
        // Draws boss bullets
        ctx.drawImage(bossBulletImage, bossBulletArray[i].x, bossBulletArray[i].y, bulletWidth, bulletHeight);
        
        // Removes boss bullets if outside of screen
        if(bossBulletArray[i].x < -400 || bossBulletArray[i].x > ctx.canvas.width + 400 || bossBulletArray[i].y < bulletHeight || bossBulletArray[i].y > ctx.canvas.height){
            bossBulletArray.splice(i, 1);
        } 
    }
}

// Checks collision from boss attack
function bossAttackCollision(){
    // Checks collision with player
    for(var i = bossBulletArray.length - 1; i >= 0; i--){
        if(bossBulletArray[i]){
            if(collisionDetection(bossBulletArray[i].x, bossBulletArray[i].y, bulletWidth, bulletHeight, playerScreenX + HITBOX_PLAYER_X * scalefX, playerScreenY + HITBOX_PLAYER_Y * scalefY, playerWidth - HITBOX_PLAYER_WIDTH * scalefX, playerHeight - HITBOX_PLAYER_HEIGHT * scalefY)){
                takeDamage();
            }
        }
        
    }
}

// Resets boss values
function resetBoss(){
    nextLevel();
    bossSpeed = BOSS_SPEED + (level / BOSS_SPAWN_LVL) * 2;
    bossMaxHealth = Math.floor(bossMaxHealth + bossMaxHealth * 0.5);
    bossHealth = bossMaxHealth;
    attack1Started = false;
    if(currentBossStage < bossStages.length - 1){
        currentBossStage++;
    }
    bossImage.src = bossStages[currentBossStage]; // Updates boss sprite
    bossKilled = true;
    backgroundSoundStarted == false;
}

// Draws boss healthbar
function bossHealthbar(){
    // Healthbar background
    ctx.fillStyle = "black";
    ctx.fillRect(BOSS_HEALTHBAR_X - 3, (BOSS_HEALTHBAR_Y - 3), (BOSS_HEALTHBAR_WIDTH + 6) * scalefX, (BOSS_HEALTHBAR_HEIGHT + 6) * scalefY);
    
    // Health
    ctx.fillStyle = "red";
    ctx.fillRect(BOSS_HEALTHBAR_X, BOSS_HEALTHBAR_Y, ((BOSS_HEALTHBAR_WIDTH * scalefX / bossMaxHealth) * bossHealth), BOSS_HEALTHBAR_HEIGHT * scalefY);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(bossHealth, (ctx.canvas.width/2), (BOSS_HEALTHBAR_Y + 20) * scalefY);
}

// Detects pressed key
function keyDownHandler(event){
    
    // Movement inputs
    if (event.keyCode == W){
        facing = NORTH;
        isMovingNorth = true;
    }
    if (event.keyCode == D){
        facing = EAST;
        isMovingEast = true;
    }
    if (event.keyCode == S){
        facing = SOUTH;
        isMovingSouth = true;
    }
    if (event.keyCode == A){
        facing = WEST;
        isMovingWest = true;
    }
    
    // Starts background sound
    if (backgroundSoundStarted == false){
        //backgroundSound.play();
        backgroundSoundStarted = true;
    }
    
    // Shooting inputs
    if (event.keyCode == ARROW_UP){
        shoot(NORTH);
    }
    if (event.keyCode == ARROW_RIGHT){
        shoot(EAST);
    }
    if (event.keyCode == ARROW_DOWN){
        shoot(SOUTH);
    }
    if (event.keyCode == ARROW_LEFT){
        shoot(WEST);
    }
    
    if (event.keyCode == SPACE && isGameover){
        document.location.reload(true);
    }
    
    // Pauses/resumes game
    if (event.keyCode == ESC || event.keyCode == SPACE){
        if(gamePaused == false && (isGameover == false)){
            pauseGame();
        }
        else if (gamePaused){
            resumeGame();
        }    
    }
    
    // Toggle hitboxes
    if (event.keyCode == H){
        if(showHitboxes == false){
            showHitboxes = true;
        } else {
            showHitboxes = false;
        }
    }
}

// Detects released key
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

// Pauses the game
function pauseGame(){
    clearInterval(gameloop);
    clearInterval(bossAttackInterval);
    attack1Started = false;
    gamePaused = true;
    
    // Draws pause screen
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "white";
    ctx.font = "bold 100px sans-serif";
    ctx.fillText("GAME PAUSED", ctx.canvas.width / 2, (ctx.canvas.height / 2) - 100);
    
    ctx.drawImage(boostFiringspeed, ((ctx.canvas.width / 2) - BOOSTER_WIDTH) + 300, ctx.canvas.height - 230, 100 * scalefX, 100);
    ctx.drawImage(boostDamage, ((ctx.canvas.width / 2) - BOOSTER_WIDTH) + 100, ctx.canvas.height - 230, 100, 100);
    ctx.drawImage(boostSpeed, ((ctx.canvas.width / 2) - BOOSTER_WIDTH) - 100, ctx.canvas.height - 230, 100, 100);
    ctx.drawImage(boostRange, ((ctx.canvas.width / 2) - BOOSTER_WIDTH) - 300, ctx.canvas.height - 230, 100, 100);
    
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("+Firerate", (ctx.canvas.width / 2) + 300, ctx.canvas.height - 100);
    ctx.fillText("+Damage", (ctx.canvas.width / 2) + 100, ctx.canvas.height - 100);
    ctx.fillText("+Speed", (ctx.canvas.width / 2) - 100, ctx.canvas.height - 100);
    ctx.fillText("+Range", (ctx.canvas.width / 2) - 300, ctx.canvas.height - 100);
}

// Resumes the game
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
  if(showHitboxes){
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.rect(x1,y1,w1,h1);
      ctx.rect(x2,y2,w2,h2);
      ctx.stroke();
  }
  
  if (x1 <= x2+w2 && x2 <= x1+w1 && y1 <= y2+h2 && y2 <= y1+h1)
  {
	return true;
  }
  else 
    return false;
}

// Draws hearts
function drawHearts(){
    for(var i = 1; i <= playerHealth; i++){
        
        if (i < 7){ // First row of hearts
            var heartX = (ctx.canvas.width - HEART_FIRST_POS_X * scalefX) + (heartWidth + HEART_DISTANCE_BETWEEN * scalefX) * i;
            var heartY = HEART_POS_Y;
        } else { // Seconds row of hearts
            heartX = (ctx.canvas.width - HEART_FIRST_POS_X * scalefX) + (heartWidth + HEART_DISTANCE_BETWEEN * scalefX) * (i-6);
            heartY = HEART_POS_Y + heartHeight;
        }
        ctx.drawImage(heartImage, heartX, heartY, heartWidth, heartHeight);
    }
}

//Sound function
function sound(src, loop){
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    if (loop){
        this.sound.setAttribute("loop", true);
    }
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

// Shooting delay function
function shootingDelayFunc(){
    shootingEnabled = true;
}

// Spawns boosters
function spawnBooster(j){
    if(Math.random() < 0.2){
       var booster = new Object();
        booster.x = enemyArray[j].x + ((playerWidth - BOOSTER_WIDTH) / 2);
        booster.y = enemyArray[j].y + (playerHeight - BOOSTER_HEIGHT);
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

// Draws booster
function drawBooster(){
    for(var i = boosterArray.length - 1; i >= 0; i--){
        
        var differenceX = playerScreenX + (playerWidth/ 2) - boosterArray[i].x - (BOOSTER_WIDTH * scalefX / 2); // Difference in X
        var differenceY = playerScreenY + (playerHeight / 2) - boosterArray[i].y - (BOOSTER_HEIGHT * scalefY / 2); // Difference in Y
        
        if((Math.abs(differenceX) < BOOSTER_MAGNETFORCE_RANGE * scalefX) && (Math.abs(differenceY) < BOOSTER_MAGNETFORCE_RANGE * scalefY)){ // If in range
           var hypotenuse = Math.pow((Math.pow(differenceX, 2) + Math.pow(differenceY, 2)), 0.5);
            boosterArray[i].x += boosterArray[i].magnetForce * (differenceX / hypotenuse); // Move towards player
            boosterArray[i].y += boosterArray[i].magnetForce * (differenceY / hypotenuse); // Move towards player
        }
        ctx.drawImage(boosterArray[i].img, boosterArray[i].x, boosterArray[i].y, BOOSTER_WIDTH * scalefX, BOOSTER_HEIGHT * scalefY);
    }
    boosterCollision();
}

// Picks up booster
function boosterCollision(){
    
    for(var i = boosterArray.length - 1; i >= 0; i--){
        if(collisionDetection(boosterArray[i].x, boosterArray[i].y, BOOSTER_WIDTH * scalefX, BOOSTER_HEIGHT * scalefY, playerScreenX + HITBOX_PLAYER_X * scalefX, playerScreenY + HITBOX_PLAYER_Y * scalefY, playerWidth- HITBOX_PLAYER_WIDTH * scalefX, playerHeight - HITBOX_PLAYER_HEIGHT * scalefY)){
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

// Stops game loop
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

function setCanvas() {
    ctx.canvas.width = $(window).width();
    ctx.canvas.height = $(window).height();
    scalefX = ctx.canvas.width / 1920;
    scalefY = ctx.canvas.height / 969;
    
    playerWidth = CHARACTER_WIDTH * scalefX;
    playerHeight = CHARACTER_HEIGHT * scalefY;
    bulletWidth = BULLET_WIDTH * scalefX;
    bulletHeight = BULLET_HEIGHT * scalefY;
    enemyMaxSpeed = ENEMY_MAX_SPEED * ((scalefX + scalefY) / 2);
    enemyMinSpeed = ENEMY_MIN_SPEED * ((scalefX + scalefY) / 2);
    heartWidth = HEART_WIDTH * scalefX;
    heartHeight = HEART_WIDTH * scalefY;
    playerSpeed = SCREEN_CHARACTER_SPEED * ((scalefX + scalefY) / 2);
}