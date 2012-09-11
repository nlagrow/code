/** @file game.js
 *
 *  @brief Contains the main game logic.
 *
 *  @author Nick LaGrow (nlagrow)
 *  @author Lucas Ray (ltray)
 */
function Game(seed) {
  // seed can be used to create some consistent randomization for many things,
  // but in this case it's just used to consistently pick a random death quote
  // per game (die to see what I'm talking about).
  this.seed = seed;
  var requestAnimationFrame = function() {
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
  }();
  window.requestAnimationFrame = requestAnimationFrame;

  /////////////////////////////
  // SETUP
  /////////////////////////////
  // Functions and variables which deal with game setup.
  /* make the player */
  State.player = new Classes.Player();

  // Initial starting position, velocity, acceleration
  State.player.pos = [Constants.PLAYER_STARTING_POS_X,
                      Constants.PLAYER_STARTING_POS_Y];
  State.player.velocity = Constants.PLAYER_STARTING_VEL;
  State.player.accel = Constants.PLAYER_STARTING_ACCEL;
  State.actors.push(State.player);

  /** @brief Spawns obstacles (rock walls, rocks, trees).
   */
  function spawnObstacles() {
    /* make the walls */
    // bottom
    var rockwall_temp = new Classes.RockWall(canvas.width,
      Constants.ROCKWALL_WIDTH);
    rockwall_temp.pos = [0, canvas.height - Constants.ROCKWALL_WIDTH];
    State.obstacles.push(rockwall_temp);

    // left
    rockwall_temp = new Classes.RockWall(Constants.ROCKWALL_WIDTH,
      (canvas.height / 2) - Constants.GAP_WIDTH);
    rockwall_temp.pos = [0, Constants.GUI_BAR_HEIGHT];
    State.obstacles.push(rockwall_temp);

    rockwall_temp = new Classes.RockWall(Constants.ROCKWALL_WIDTH,
      (canvas.height / 2) - Constants.GAP_WIDTH);
    rockwall_temp.pos = [0, (canvas.height / 2) + Constants.GAP_WIDTH];
    State.obstacles.push(rockwall_temp);

    // right
    rockwall_temp = new Classes.RockWall(Constants.ROCKWALL_WIDTH,
      (canvas.height / 2) - Constants.GAP_WIDTH);
    rockwall_temp.pos = [canvas.width - Constants.ROCKWALL_WIDTH,
      Constants.GUI_BAR_HEIGHT];
    State.obstacles.push(rockwall_temp);

    rockwall_temp = new Classes.RockWall(Constants.ROCKWALL_WIDTH,
      (canvas.height / 2) - Constants.GAP_WIDTH);
    rockwall_temp.pos = [canvas.width - Constants.ROCKWALL_WIDTH,
      (canvas.height / 2) + Constants.GAP_WIDTH];
    State.obstacles.push(rockwall_temp);

    // top
    rockwall_temp = new Classes.RockWall(canvas.width,
      Constants.ROCKWALL_WIDTH);
    rockwall_temp.pos = [0, Constants.GUI_BAR_HEIGHT];
    State.obstacles.push(rockwall_temp);

    /* initialize some rocks */
    for (var j = 0; j < Constants.NUM_ROCKS; j++) {
      var rock_temp = new Classes.Rock();
      rock_temp.pos = getRandomPos();
      while (tooCloseToPlayer(rock_temp)) {
        rock_temp.pos = getRandomPos();
      }
      State.obstacles.push(rock_temp);
    }

    /* initialize some trees */
    for (var j = 0; j < Constants.NUM_TREES; j++) {
      var tree_temp = new Classes.Tree();
      tree_temp.pos = getRandomPos();
      while (tooCloseToPlayer(tree_temp)) {
        tree_temp.pos = getRandomPos();
      }
      State.obstacles.push(tree_temp);
    }
  }

  /** @brief spawns some enemies of random type and size.
   */
  function spawnEnemies() {
    for (var j = 0;
         j < Math.min(State.score / 10 + 1, Constants.MAX_NUM_ENEMIES); j++) {
      var move;
      var render;
      var type;
      var size = Math.floor((Math.random() * 20) + 20);
      var health = 50;
      var n;

      // Game gets harder as you get a higher score
      if (State.score < Constants.LEVEL_1_TOP) {
        n = 1;
      } else if (State.score < Constants.LEVEL_2_TOP) {
        n = 2;
      } else if (State.score < Constants.LEVEL_3_TOP) {
        n = 3;
      } else {
        n = 4;
      }

      // Increase number of types of enemies spawned as game progresses.
      type = Math.floor(Math.random() * n);
      switch (type) {
        case Constants.ENM_BIRD:
          move = Classes.bird_move;
          render = Classes.bird_render;
          size = Constants.BIRD_SIZE;
          break;
        case Constants.ENM_BAT:
          move = Classes.bat_move;
          render = Classes.bat_render;
          size = Constants.BIRD_SIZE;
          break;
        case Constants.ENM_WSPIDER:
          move = Classes.wspider_move;
          render = Classes.wspider_render;
          size = Constants.WSPIDER_SIZE;
          health = Constants.WSPIDER_HEALTH;
          break;
        default:  // defaults to spiders
          move = Classes.spider_move;
          render = Classes.spider_render;
          break;
      }

      var enemy_temp = new Classes.Enemy(size, size, health, render, move);
      enemy_temp.pos = [Math.floor(Math.random() * 101 + 250),
                        Math.floor(Math.random() * 101 + 250)];
      State.enemies.push(enemy_temp);
    }
    waitforspawn = 0;
  }

  // Spawn helpers
  /** @brief Gets a random position on the game board (inside of rock walls).
   */
  function getRandomPos() {
    return [Math.floor(Math.random() * (canvas.width -
            Constants.ROCKWALL_WIDTH - Constants.WALL_WIDTH + 1) +
            Constants.WALL_WIDTH),
            Math.floor(Math.random() * (canvas.height -
            Constants.ROCKWALL_WIDTH - Constants.WALL_WIDTH + 1) +
            Constants.WALL_WIDTH + Constants.GUI_BAR_HEIGHT)];
  }

  /** @brief Returns true iff an object is "too close" to the player
    *        (within 50 units).
    */
  function tooCloseToPlayer(ob) {
    deltax = Math.abs(State.player.pos[0] - ob.pos[0]);
    deltay = Math.abs(State.player.pos[1] - ob.pos[1]);
    return ((deltax < 50) || (deltay < 50));
  }

  /** @brief Shoots a projectile from the player's current location. Included
   *         here as it essentially spawns a projectile.
   */
  function shoot() {
    var proj_pos = [State.player.pos[0] + (State.player.width / 2),
                    State.player.pos[1] + (State.player.height / 2)];
    var proj = new Classes.Projectile(proj_pos, State.player.shooting_dir);
    State.projectiles.push(proj);
  }

  ////////////////////////////////////////////
  // High Order
  ////////////////////////////////////////////
  // Functions used to assist with higher-order function use.
  /** @brief Calls an object's .render().
   */
  function general_render(obj) {
    obj.render();
  }

  /** @brief Calls an object's .move().
   */
  function general_move(obj) {
    obj.move();
  }

  /** @brief render()'s the object iff it's drawFirst is true. Used to
   *         render certain objects ontop of others.
   */
  function general_obs(obj) {
    if (obj.drawFirst === true) {
      obj.render();
    }
    obj.drawFirst = !obj.drawFirst;
  }

  ////////////////////////////////////////////
  // Util
  ////////////////////////////////////////////
  // Miscellaneous functions which add or help with utility
  /** @brief Basic timer, increments the current time by 1. To be called via
   *         setInterval(timer, 1000);
   */
  State.time = 0;
  function timer() {
    State.time += 1;
  }

  /** @brief Gives the user back a random quote in the form [quote, author].
   */
  function getRandomQuote() {
    var quotes = Constants.quotes;
    return quotes[Math.floor(this.seed * quotes.length)];
  }

  ////////////////////////////////////////////
  // UI functions
  ////////////////////////////////////////////
  // Functions which render or manipulate the UI.
  /** @brief Clears the entire canvas. Saves and restores the current transform
   *         in case it is being used.
   */
  function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /** @brief Renders the timer.
   */
  function render_timer() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Time: " + State.time, canvas.width/4, Constants.GUI_BAR_HEIGHT/3);
  }

  State.score = 0;
  /** @brief Renders the score.
   */
  function render_score() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + State.score, 3 * canvas.width / 4,
      Constants.GUI_BAR_HEIGHT / 3);
  }

  /** @brief Renders the health bar.
   */
  function render_health() {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 3 * Constants.GUI_BAR_HEIGHT / 4,
      canvas.width*(State.player.health / Constants.PLAYER_HEALTH),
      Constants.GUI_BAR_HEIGHT / 4);
  }

  /** @brief Renders the head's up display (HUD) -- i.e. the timer,
    *        score, healthbar.
   */
  function render_hud() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, Constants.GUI_BAR_HEIGHT);

    render_timer();
    render_score();
    render_health();
  }

  /** @brief Draws the splash screen.
   */
  function draw_splash() {
    clear();

    // Background
    ctx.fillStyle = "#EBEBEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Foreground
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#DC143C";
    ctx.fillText("15-237 Homework 1", canvas.width/2, canvas.height/4);

    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    ctx.fillText("Press Enter to continue", canvas.width/2, 3*canvas.height/4);
  }

  /** @brief Draws a death screen.
   */
  function draw_death() {
    var rand_quote;
    clear();

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Foreground
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("You Died", canvas.width/2, canvas.height/4);

    // Inspiring quote
    rand_quote = getRandomQuote();
    ctx.font = "15px Arial";
    ctx.fillStyle = "grey";
    ctx.fillText(rand_quote[0],
      canvas.width/2, 3*canvas.height/10);

    // Author of quote
    ctx.font = "15px Arial";
    ctx.fillStyle = "grey";
    ctx.fillText(rand_quote[1], 7*canvas.width/10, 33*canvas.height/100);

    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Score: " + State.score, canvas.width/2, 2*canvas.height/3);

    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Press Enter to continue", canvas.width/2, 3*canvas.height/4);
  }

  ////////////////////////////////////////////
  // Keyboard functions
  ////////////////////////////////////////////
  // Splash screen key down event
  var game_started = false;
  /** @brief keyDown function when viewing the splash screen.
   */
  function splashKeyDown(event) {
    switch(event.keyCode) {
      // Enter
      case 13:
        game_started = true;
        break;
      default:
        break;
    }
  }

  // Default key down event variables
  var lDown = 0;
  var uDown = 0;
  var rDown = 0;
  var dDown = 0;
  var lShoot = 0;
  var uShoot = 0;
  var rShoot = 0;
  var dShoot = 0;
  var shooting_id;
  var shooting_vec = [0, 0];

  /** @brief Default keyDown handler. Handles movement (WASD) and
   *         shooting (arrow keys).
   */
  function onKeyDown(event) {
    switch(event.keyCode) {
      // Movement
      // a
      case 65:
        lDown = 1;
        break;
      // w
      case 87:
        uDown = 1;
        break;
      // d
      case 68:
        rDown = 1;
        break;
      // s
      case 83:
        dDown = 1;
        break;

      // Shooting
      // left
      case 37:
        shooting_vec = [-1, 0];
        lShoot = 1;
        break;
      // up
      case 38:
        shooting_vec = [0, -1];
        uShoot = 1;
        break;
      // right
      case 39:
        shooting_vec = [1, 0];
        rShoot = 1;
        break;
      // down
      case 40:
        shooting_vec = [0, 1];
        dShoot = 1;
        break;
      default:
        break;
    }
  }

  /** @brief Default keyUp handler.
   */
  function onKeyUp(event) {
    switch(event.keyCode) {
      // Movement
      // a
      case 65:
        lDown = 0;
        break;
      // w
      case 87:
        uDown = 0;
        break;
      // d
      case 68:
        rDown = 0;
        break;
      // s
      case 83:
        dDown = 0;
        break;

      // Shooting
      // left
      case 37:
        lShoot = 0;
        break;
      // up
      case 38:
        uShoot = 0;
        break;
      // right
      case 39:
        rShoot = 0;
        break;
      // down
      case 40:
        dShoot = 0;
        break;
      default:
        break;
    }
  }

  /** @brief Processes actions caused by keys.
   */
  function handle_keys() {
    // Movement
    if (lDown === 1) {
      State.player.accel[0] -= Constants.ACCEL_SPEED;
    }
    if (uDown === 1) {
      State.player.accel[1] -= Constants.ACCEL_SPEED;
    }
    if (rDown === 1) {
      State.player.accel[0] += Constants.ACCEL_SPEED;
    }
    if (dDown === 1) {
      State.player.accel[1] += Constants.ACCEL_SPEED;
    }

    // Shooting
    if (lShoot || uShoot || rShoot || dShoot) {
      State.player.shooting_dir = shooting_vec;
      if (shooting_id === undefined) {
        shooting_id = setInterval(shoot, 200);
      }
    } else {
      clearInterval(shooting_id);
      shooting_id = undefined;
    }
  }

  /** @brief Cancels all key downs when the window loses focus.
   */
  window.onblur = function() {
    lDown = 0;
    uDown = 0;
    rDown = 0;
    dDown = 0;
    lShoot = 0;
    uShoot = 0;
    rShoot = 0;
    dShoot = 0;
  }

  ////////////////////////////////////////////
  // Core Game Functions
  ////////////////////////////////////////////
  // Contains many of the core functions used in the game.
  var waitforspawn = 0;

  /** @brief Resets the game.
   */
  function game_reset() {
    lDown = 0;
    uDown = 0;
    rDown = 0;
    dDown = 0;
    lShoot = 0;
    uShoot = 0;
    rShoot = 0;
    dShoot = 0;
    State.player.pos = [Constants.PLAYER_STARTING_POS_X,
                        Constants.PLAYER_STARTING_POS_Y];
    State.player.health = Constants.PLAYER_HEALTH;
    State.enemies.length = 0;
    State.obstacles.length = 0;
    State.projectiles.length = 0;
    State.score = 0;
    State.time = 0;
    this.seed = Math.random();
    clearInterval(State.timer);
  }

  /** @brief Default step() function. Each step computes the next game state
   *         and renders it.
   */
  function step() {
    /* Handle GUI and Keyboard events */
    clear();
    render_hud();
    handle_keys();

    /* First pass / if map isn't well formed */
    if (State.obstacles.length === 0){
      spawnObstacles();
    }

    if ((State.enemies.length === 0) && (waitforspawn === 0)) {
      State.respawnTimer = setTimeout(spawnEnemies, Constants.ENEMY_RESPAWN_DELAY);
      waitforspawn = 1;
    }

    // Background
    ctx.fillStyle=("#ADE857");
    ctx.fillRect(0, Constants.GUI_BAR_HEIGHT, canvas.width,
      canvas.height - Constants.GUI_BAR_HEIGHT);

    /* handle map switches */
    if ((State.player.pos[0] < 0) || (State.player.pos[0] > canvas.width)) {
      /* clear any waiting enemy spawns */
      clearTimeout(State.respawnTimer);
      
      if (State.player.pos[0] < 0) {
        State.player.pos[0] = canvas.width - Constants.WALL_WIDTH;
      } else {
        State.player.pos[0] = Constants.WALL_WIDTH;
      }

      /* reset the enemy and obstacle lists */
      State.obstacles.length = 0;
      State.enemies.length = 0;

      /* repopulate the lists */
      spawnObstacles();
      spawnEnemies();
    }

    /* Handle player, objects written behind */
    State.obstacles.map(general_obs);
    State.actors.map(general_move);
    State.actors.map(general_render);

    /* Remove enemies that have died */
    for (var j = 0; j < State.enemies.length; j++) {
      if (State.enemies[j].health <= 0) {
        State.score += State.enemies[j].points;
        State.enemies.splice(j, 1);
      }
    }

    /* Remove projectiles that are done exploding */
    for (var j = 0; j < State.projectiles.length; j++) {
      if (State.projectiles[j].exploding < -10) {
        State.projectiles.splice(j, 1);
      }
    }

    /* Handle enemies, objects written in front */
    State.enemies.map(general_move);
    State.enemies.map(general_render);
    State.obstacles.map(general_obs);

    /* Projectiles */
    State.projectiles.map(general_move);
    State.projectiles.map(general_render);

    if (State.player.health > 0) {
      requestAnimationFrame(step);
    } else {
      State.enemies.length = 0;
      State.obstacles.length = 0;
      canvas.removeEventListener('keydown', onKeyDown, false);
      canvas.removeEventListener('keyup', onKeyUp, false);
      canvas.addEventListener('keydown', splashKeyDown, false);
      game_started = false;
      requestAnimationFrame(death_screen);
    }
  }

  /** @brief Displays a splash screen and waits for user to begin the game.
   */
  function splash_screen() {
    if (game_started === false) {
      draw_splash();
      requestAnimationFrame(splash_screen);
    } else {
      start();
    }
  }

  /** @brief Displays a death screen and allows user to replay the game.
   */
  function death_screen() {
    if (game_started === false) {
      canvas.addEventListener('keydown', splashKeyDown, false);
      draw_death();
      requestAnimationFrame(death_screen);
    } else {
      game_reset();
      start();
    }
  }

  /** @brief Removes splash screen event listener, installs game event
   *         event listeners, and starts the game
   */
  function start() {
    // Install correct event handlers
    canvas.removeEventListener('keydown', splashKeyDown, false);
    canvas.addEventListener('keydown', onKeyDown, false);
    canvas.addEventListener('keyup', onKeyUp, false);
    State.timer = setInterval(timer, 1000);
    requestAnimationFrame(step);
  }

  canvas.addEventListener('keydown', splashKeyDown, false);

  // make canvas focusable, then give it focus!
  canvas.setAttribute('tabindex','0');
  canvas.focus();

  // start by displaying the splash screen
  requestAnimationFrame(splash_screen);
}

var seed = Math.random();
var run = new Game(seed);
