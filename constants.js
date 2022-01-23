"use strict";

const TIME_PER_FRAME = 17;   //this means 60 fps 

const GAME_FONT = "bold 20px sans-serif";
const GAME_FONT_COLOR = "white";
const GAME_BACKGROUND_COLOR = "#512B00"; 

const COUNTER_X = 10;   //X-coord for the counter
const COUNTER_Y = 50;  //Y-coord for the counter

const PATH_CHARACTER = "img/spritesheet3.png";
const PATH_ENEMY = "img/enemy_spritesheet.png";
const PATH_BOSS_STAGE_1 = "img/boss_stage_1.png";
const PATH_BOSS_STAGE_2 = "img/boss_stage_2.png";
const PATH_BOSS_STAGE_3 = "img/boss_stage_3.png";
const PATH_BOSS_STAGE_4 = "img/boss_stage_4.png";
const PATH_BOSS_DEAD = "img/boss_dead.png";
const PATH_BULLET = "img/bullet.png";
const PATH_BOSS_BULLET = "img/boss_bullet.png";
const PATH_HEART = "img/heart.png"

const PATH_BOOST_SPEED = "img/boost_speed.png";
const PATH_BOOST_FIRINGSPEED = "img/boost_firingspeed.png";
const PATH_BOOST_RANGE = "img/boost_range.png";
const PATH_BOOST_DAMAGE = "img/boost_damage.png";

const BOOSTER_WIDTH = 48;
const BOOSTER_HEIGHT = 48;
const BOOSTER_MAGNETFORCE = 10;
const BOOSTER_MAGNETFORCE_RANGE = 300;

const HEART_WIDTH = 40;
const HEART_POS_Y = 10;
const HEART_DISTANCE_BETWEEN = 5;
const HEART_FIRST_POS_X = (45*7 + 10);

const BOSS_WIDTH = 384;
const BOSS_HEIGHT = 384;
const BOSS_SPRITE_WIDTH = 3456;
const BOSS_SPRITE_START_X = 0;
const BOSS_SPEED = 15;
const BOSS_ATTACKSPEED = 20;

const BOSS_SPAWN_LVL = 5;
const BOSS_HEALTH = 100;
const BOSS_BULLET_SPEED = 5;
const BOSS_BULLET_AMOUNT = 10;

const BOSS_HEALTHBAR_WIDTH = 500;
const BOSS_HEALTHBAR_HEIGHT = 30;
const BOSS_HEALTHBAR_X = (window.innerWidth / 2) - (BOSS_HEALTHBAR_WIDTH / 2)
const BOSS_HEALTHBAR_Y = window.innerHeight - 60;

const CHARACTER_WIDTH = 72;
const CHARACTER_HEIGHT = 96;

const ENEMY_HP = 3;
const ENEMY_MAX_SPEED = 4;
const ENEMY_MIN_SPEED = 2;

const SPRITE_START_X = 0;
const SPRITE_START_Y = 98;
const SPRITE_WIDTH = 216;

const SCREEN_CHARACTER_X = (window.innerWidth / 2) - 21;
const SCREEN_CHARACTER_Y = (window.innerHeight / 2) - 35;
const SCREEN_CHARACTER_SPEED = 5;

const SPRITE_START_NORTH_Y = 2;
const SPRITE_START_EAST_Y = 104;
const SPRITE_START_SOUTH_Y = 198;
const SPRITE_START_WEST_Y = 296;

const HITBOX_PLAYER_X = 20;
const HITBOX_PLAYER_Y = 50;
const HITBOX_PLAYER_WIDTH = HITBOX_PLAYER_X * 2;
const HITBOX_PLAYER_HEIGHT = HITBOX_PLAYER_Y + 10;

const BULLET_SPEED = SCREEN_CHARACTER_SPEED * 1.5;
const BULLET_DIRECTION_SPEED = SCREEN_CHARACTER_SPEED / 2;
const BULLET_WIDTH = 21;
const BULLET_HEIGHT = 21;

const SHOOTING_DELAY = 300; // In milliseconds
const SHOOTING_RANGE = 500;


const NORTH = 1;
const EAST = 0;
const SOUTH = 3;
const WEST = 2;

const W = 87;
const D = 68;
const S = 83;
const A = 65;

const H = 72;

const SPACE = 32;
const ESC = 27;

const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
const ARROW_LEFT = 37;