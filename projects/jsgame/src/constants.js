/** @file constants.js
 *  @brief Object to hold constants. Can tweak these to change behavior of game.
 *
 *  @author Lucas Ray (ltray)
 *  @author Nick LaGrow (nlagorw)
 */
function Constants() {}

// Misc constants
Constants.WALL_WIDTH = 40;
Constants.GUI_BAR_HEIGHT = 50;
Constants.GAP_WIDTH = 60;
Constants.ROCK_WIDTH = 40;
Constants.ROCK_HEIGHT = 40;
Constants.TREE_WIDTH = 20;
Constants.TREE_HEIGHT = 20;
Constants.LEVEL_1_TOP = 11;
Constants.LEVEL_2_TOP = 21;
Constants.LEVEL_3_TOP = 31;

// Player constants
Constants.PLAYER_WIDTH = 30;
Constants.PLAYER_HEIGHT = 30;
Constants.ACCEL_SPEED = 1;
Constants.MAX_PLAYER_SPEED = 10;
Constants.MAX_PLAYER_ACCEL = 2;
Constants.ACCEL_DECAY = 0.9;
Constants.VEL_DECAY = 0.5;
Constants.PLAYER_ATK = 20;
Constants.PLAYER_HEALTH = 100;
Constants.PROJ_SPEED = 10;
Constants.PROJ_WIDTH = 8;
Constants.PROJ_HEIGHT = 4;
Constants.PROJ_EXPLOSION_R = 5;
Constants.PLAYER_STARTING_POS_X = 50; 
Constants.PLAYER_STARTING_POS_Y = 50 + Constants.GUI_BAR_HEIGHT;
Constants.PLAYER_STARTING_VEL = [10, 10];
Constants.PLAYER_STARTING_ACCEL = [0, 0];

// Enemy constants
Constants.MAX_NUM_ENEMIES = 10;
Constants.ENM_SPIDER = 0;
Constants.ENM_BIRD = 1;
Constants.ENM_BAT = 2;
Constants.ENM_WSPIDER = 3;
Constants.MAX_NUM_ENEMIES = 10;
Constants.ENEMY_ATTACK = 5;
Constants.ENEMY_POINTS = 1;
Constants.SPIDER_SPEED = 3;
Constants.SPIDER_ACCEL = 10;
Constants.BIRD_SPEED = 4;
Constants.BIRD_ACCEL = .2;
Constants.BIRD_SIZE = 20;
Constants.WSPIDER_SIZE = 50;
Constants.WSPIDER_HEALTH = 100;
Constants.ENEMY_RESPAWN_DELAY = 2000;

// Environment
Constants.ROCKWALL_WIDTH = 40;
Constants.NUM_ROCKS = 10;
Constants.NUM_TREES = 5;

// Quotes
Constants.quotes = [
  ["\"You miss 100% of the shots you don't take. -Wayne Gretzky\"",
    "-Michael Scott"],
  ["\"Snake? Snake! Snaaaaaaaaaaaake!?\"",
    "-Colonel"],
  ["\"At least I have chicken.\"",
    "-Leeroy"],
  ["\"Never underestimate the power of stupid people in large groups.\"",
    "-Anonymous"],
  ["\"Is German for... I don't know what [German] means. We don't say that in America\"",
    "-Justin Bieber"],
]

Window.Constants = new Constants();
