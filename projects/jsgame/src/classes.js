/** @file classes.js
 *  @brief Object used to create new objects (players, enemies, obstacles, etc.)
 *
 *  @author Lucas Ray (ltray)
 *  @author Nick LaGrow (nlagrow)
 */
function Classes() {}

/////////////////////////////
// Object definitions
/////////////////////////////

/** @brief general definition for dynamic objects.
 */
Classes.Actor = function Actor() {
  this.pos = [0,0];
  this.velocity = [0,0];
  this.accel = [0,0];
  this.width = 0;
  this.height = 0;
  this.damp = 0;
  this.state = 0;
  this.statecount = 0;
}

// Generic render() function (should only be used for debugging)
Classes.Actor.prototype.render = function() {
  ctx.fillStyle = "red";
  ctx.fillRect(this.pos[0], this.pos[1], this.width, this.height);
}

// Generic move() which does nothing
Classes.Actor.prototype.move = function() {}

/** @brief definition for the player-controllable object
 */
Classes.Player = function Player() {
  Classes.Actor.call(this);
  this.health = Constants.PLAYER_HEALTH;
  this.width = Constants.PLAYER_WIDTH;
  this.height = Constants.PLAYER_HEIGHT;
  this.shooting_dir = [0, 0];
}

Classes.Player.prototype = new Classes.Actor();
Classes.Player.prototype.constructor = Classes.Player;

// Player move()
Classes.Player.prototype.move = function() {
  this.velocity[0] *= Constants.VEL_DECAY;
  this.velocity[1] *= Constants.VEL_DECAY;
  this.accel[0] *= Constants.ACCEL_DECAY;
  this.accel[1] *= Constants.ACCEL_DECAY;
  this.velocity[0] += this.accel[0];
  this.velocity[1] += this.accel[1];

  // React to obstacles
  for (var j = 0; j < State.obstacles.length; j++) {
    var ob = State.obstacles[j];
    if (Classes.isCollision(this, ob)) {
      var ax1 = this.pos[0];
      var ax2 = this.pos[0] + this.width;
      var ay1 = this.pos[1];
      var ay2 = this.pos[1] + this.height;

      var ox1 = ob.pos[0];
      var ox2 = ob.pos[0] + ob.width;
      var oy1 = ob.pos[1];
      var oy2 = ob.pos[1] + ob.height;

      // Causes player to "bounce" off objects in more realistic fashion; i.e.
      // hitting the left side of an object from the top causes you to
      // "bounce" slightly to the left (think how the ball reacts to the
      // paddle in pong)
      if ((ax1 < (ox1 + (ob.width / 2))) && (this.velocity[0] > 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
        this.accel[0] = 0;
      } else if ((ax1 >= (ox1 + (ob.width / 2))) && (this.velocity[0] < 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
        this.accel[0] = 0;
      }
      if ((ay1 < (oy1 + (ob.height / 2))) && (this.velocity[1] > 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
        this.accel[1] = 0;
      } else if ((ay1 >= (oy1 + (ob.height / 2))) && (this.velocity[1] < 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
        this.accel[1] = 0;
      }
    }
  }

  // React to enemies
  for (var j = 0; j < State.enemies.length; j++) {
    var ob = State.enemies[j];
    if (Classes.isCollision(this, ob)) {
      // Damage both player and enemy if they touch
      this.health -= ob.attack;
      ob.health -= Constants.PLAYER_ATK;
      var ax1 = this.pos[0];
      var ax2 = this.pos[0] + this.width;
      var ay1 = this.pos[1];
      var ay2 = this.pos[1] + this.width;

      var ox1 = ob.pos[0];
      var ox2 = ob.pos[0] + ob.width;
      var oy1 = ob.pos[1];
      var oy2 = ob.pos[1] + ob.width;

      // Realistic bounces (see above)
      if ((ax1 < (ox1 + (ob.width / 2))) && this.velocity[0] > 0) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
        this.accel[0] = 0;
      } else if ((ax1 >= (ox1 + (ob.width / 2))) && this.velocity[0] < 0) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
        this.accel[0] = 0;
      }
      if ((ay1 < (oy1 + (ob.height / 2))) && this.velocity[1] > 0) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
        this.accel[0] = 0;
      } else if ((ay1 >= (oy1 + (ob.height / 2))) && this.velocity[1] < 0) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
        this.accel[1] = 0;
      }
    }
  }

  // Velocity and accel to stay between MAX_PLAYER_SPEED/ACCEL and
  // -MAX_PLAYER_SPEED/ACCEL
  this.velocity[0] = Math.max(
    Math.min(this.velocity[0], Constants.MAX_PLAYER_SPEED),
    -Constants.MAX_PLAYER_SPEED);
  this.velocity[1] = Math.max(
    Math.min(this.velocity[1], Constants.MAX_PLAYER_SPEED),
    -Constants.MAX_PLAYER_SPEED);
  this.accel[0] = Math.max(
    Math.min(this.accel[0], Constants.MAX_PLAYER_ACCEL),
    -Constants.MAX_PLAYER_ACCEL);
  this.accel[1] = Math.max(
    Math.min(this.accel[1], Constants.MAX_PLAYER_ACCEL),
    -Constants.MAX_PLAYER_ACCEL);

  // Apply actual speed limits (with above only, player could be moving
  // at MAX_PLAYER_SPEED * sqrt(2) true speed
  var true_speed = Math.sqrt(
    Math.pow(this.velocity[0], 2) +
    Math.pow(this.velocity[1], 2));
  if (true_speed > Constants.MAX_PLAYER_SPEED) {
    this.velocity[0] = Constants.MAX_PLAYER_SPEED *
      this.velocity[0] / true_speed;
    this.velocity[1] = Constants.MAX_PLAYER_SPEED *
      this.velocity[1] / true_speed;
  }

  // Round to avoid antialiasing (perf) and update position
  this.pos[0] = Math.round(this.pos[0] + this.velocity[0]);
  this.pos[1] = Math.round(this.pos[1] + this.velocity[1]);
}

// Player's render
Classes.Player.prototype.render = function() {
  this.statecount++;
  this.statecount = this.statecount % 20;
  var adjust = 0;

  if (this.statecount % 10 === 0) {
    this.state = !this.state;
  }

  if ((Math.abs(this.velocity[0]) < .5) &&
      (Math.abs(this.velocity[1]) < .5) &&
      (Math.abs(this.accel[0]) < .5) &&
      (Math.abs(this.accel[1]) < .5)) {
    this.state = 0;
    this.statecount = 0;
    adjust = 1;
  }

  ctx.lineWidth = 1;

  // arms
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + this.width * .4, this.pos[1] + this.height * .5);
  ctx.lineTo(this.pos[0] + this.width * .3, this.pos[1] +
    this.height * (.3 + .4 * this.state + .4 * adjust));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(this.pos[0] + this.width * .6, this.pos[1] + this.height * .5);
  ctx.lineTo(this.pos[0] + this.width * .7, this.pos[1] +
    this.height * (.7 - .4 * this.state));
  ctx.stroke();

  // legs
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + this.width * .425, this.pos[1] + this.height * .5);
  ctx.lineTo(this.pos[0] + this.width * (.325 + .1 * this.state + .1 * adjust),
    this.pos[1] + this.height * .9);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(this.pos[0] + this.width * .575, this.pos[1] + this.height * .5);
  ctx.lineTo(this.pos[0] + this.width * (.575 + .1 * this.state),
    this.pos[1] + this.height * .9);
  ctx.stroke();

  // body
  ctx.fillStyle = "white";
  ctx.fillRect(this.pos[0] + this.width * .4, this.pos[1] + this.height * .4,
    this.width * .2, this.height * .2);

  // shorts
  ctx.fillStyle = "blue";
  ctx.fillRect(this.pos[0]+this.width*.4,this.pos[1]+this.height*.6,this.width*.2,this.height*.1);

  // head
  ctx.fillStyle = "pink";
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + this.width / 2, this.pos[1] + this.height / 3);
  ctx.arc(this.pos[0] + this.width / 2, this.pos[1] + this.height / 3,
    this.width / 6, 0, 2 * Math.PI, true);
  ctx.fill();

  // eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(this.pos[0] + this.width * .425, this.pos[1] + this.height / 3,
    this.width * .03, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(this.pos[0] + this.width * .575, this.pos[1] + this.height / 3,
    this.width * .03, 0, 2 * Math.PI, true);
  ctx.fill();

  // hat
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(this.pos[0] + this.width / 2, this.pos[1] + this.height / 3,
    this.width / 6, -.25, Math.PI + .25, true);
  ctx.lineTo(this.pos[0] + this.width * .8, this.pos[1] + this.height / 3);
  ctx.fill();
}
/** @brief Object representing an enemy.
 *
 *  Enemies take in a render() and move() to make enemies more general.
 *  Enemies are primarily defined by their look and behavior, which are
 *  controlled by render() and move() respectively.
 *
 *  @param width The width of this enemy.
 *  @param height The height of this enemy.
 *  @param health The health of this enemy.
 *  @param render The render() function for this enemy.
 *  @param move The move() function for this enemy.
 */
Classes.Enemy = function Enemy(width, height, health, render, move) {
  Classes.Actor.call(this);
  this.health = health;
  this.width = width;
  this.height = height;
  this.damp = 1;
  this.render = render;
  this.move = move;
  this.state = 0;
  this.points = Constants.ENEMY_POINTS;
  this.attack = Constants.ENEMY_ATTACK;
}

Classes.Enemy.prototype = new Classes.Actor();
Classes.Enemy.prototype.constructor = Classes.Enemy;

/** @brief Object representing scenery.
 */
Classes.Obstacle = function Obstacle() {
  this.pos = [0,0];
  this.width = 0;
  this.height = 0;
  this.damp = 0;
  this.drawFirst = false;
}

Classes.Obstacle.prototype.render = function() {
  ctx.fillStyle = "blue";
  ctx.fillRect(this.pos[0], this.pos[1], this.width, this.height);
}

// A single rock
Classes.Rock = function Rock() {
  Classes.Obstacle.call(this);
  this.width = Constants.ROCK_WIDTH;
  this.height = Constants.ROCK_HEIGHT;
  this.damp = 1;
  this.drawFirst = true;
}
Classes.Rock.prototype = new Classes.Obstacle();
Classes.Rock.prototype.constructor = Classes.Rock;
Classes.Rock.prototype.width = 20;
Classes.Rock.prototype.height = 20;

// Renders a rock
Classes.drawRock = function drawRock(x,y,width,height,color) {
  // Styles
  ctx.fillStyle=color;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  // path
  ctx.beginPath();
  ctx.moveTo(x + (width / 2), y + (height / 5));
  ctx.quadraticCurveTo(x + width, y, x + (width / 5), y);
  ctx.quadraticCurveTo(x - (width / 3), y + height, x + (width / 2),
    y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + (width * 0.9),
    y + (height / 2));
  ctx.quadraticCurveTo(x + width, y, x + (width / 2), y + (height / 5));
  ctx.lineTo(x + (width / 3), y + (height / 2));
  ctx.lineTo(x + (width / 2), y + (height * 0.6));

  ctx.fill();
  ctx.stroke();
}

Classes.Rock.prototype.render = function() {
  Classes.drawRock(this.pos[0], this.pos[1], this.width, this.height, "grey");
}

/** @brief Creates a rectangle filled with rocks.
 *
 *  @param width The width of the wall.
 *  @param height The height of the wall.
 */
Classes.RockWall = function RockWall(width, height) {
  Classes.Obstacle.call(this);
  this.width = width;
  this.height = height;
  this.damp = 1;
  this.drawFirst = true;
}
Classes.RockWall.prototype = new Classes.Obstacle();
Classes.Rock.prototype.constructor = Classes.RockWall;
Classes.RockWall.prototype.render = function() {
  var a = 0;
  var b = 0;
  var w = 0;
  var h = 0;
  for(a = 0; a < this.width; a += Classes.Rock.prototype.width) {
    for(b = 0; b < this.height; b += Classes.Rock.prototype.height) {
      if ((this.width - a) < Classes.Rock.prototype.width) {
        w = this.width - a;
      } else {
        w = Classes.Rock.prototype.width;
      }
      if ((this.height - b) < Classes.Rock.prototype.height) {
        h = this.height - b;
      } else {
        h = Classes.Rock.prototype.height;
      }
      Classes.drawRock(this.pos[0] + a,this.pos[1] + b, w, h, "grey");
    }
  }
}

// A single tree
Classes.Tree = function Tree() {
  Classes.Obstacle.call(this);
  this.width = Constants.TREE_WIDTH;
  this.height = Constants.TREE_HEIGHT;
  this.damp = 1;
  this.drawFirst = false;
}
Classes.Tree.prototype = new Classes.Obstacle();
Classes.Tree.prototype.constructor = Classes.Tree;
Classes.Tree.prototype.render = function() {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";

  // bottom
  ctx.fillStyle="brown";
  ctx.beginPath();
  ctx.moveTo(this.pos[0], this.pos[1] + this.height);
  ctx.quadraticCurveTo(this.pos[0] + (this.width / 2), this.pos[1],
    this.pos[0] + (this.width / 3), this.pos[1] - (this.height * 1.5));
  ctx.lineTo(this.pos[0] + (2 * this.width / 3),
    this.pos[1] - (this.height * 1.5));
  ctx.quadraticCurveTo(this.pos[0] + (this.width / 2), this.pos[1],
    this.pos[0] + this.width, this.pos[1] + this.height);
  ctx.fill();
  ctx.stroke();

  // top
  ctx.fillStyle="green";
  ctx.beginPath();
  ctx.arc(this.pos[0],
          this.pos[1] - this.height,
          this.width, 0, 2 * Math.PI, true);
  ctx.arc(this.pos[0] + this.width,
          this.pos[1] - this.height,
          this.width, 0, 2 * Math.PI, true);
  ctx.arc(this.pos[0] + (this.width / 2),
          this.pos[1] - (this.height * 1.5),
          this.width, 0, 2 * Math.PI, true);
  ctx.fill();
}

// Projectiles
/** @brief Class used for projectiles.
 *
 *  @param pos The starting position for the projectile.
 *  @param velocity The velocity vector for this projectile.
 */
Classes.Projectile = function Projectile(pos, velocity) {
  this.pos = pos;
  this.velocity = velocity;
  this.width = Constants.PROJ_WIDTH;
  this.height = Constants.PROJ_HEIGHT;
  this.exploding = 0;
}
Classes.Projectile.prototype.render = function() {
  var proj_width = this.width;
  var proj_height = this.height;
  var explosion_rad = Constants.PROJ_EXPLOSION_R;

  ctx.fillStyle = "yellow";
  if (this.velocity[0] !== 0) {
    // Horizontal movement
    ctx.fillRect(this.pos[0] - (proj_width / 2),
      this.pos[1] - (proj_height / 2), proj_width, proj_height);
  } else if (this.velocity[1] !== 0) {
    // Vertical movement
    ctx.fillRect(this.pos[0] - (proj_height / 2),
      this.pos[1] - (proj_width / 2), proj_height, proj_width);
  } else if (this.exploding < 0) {
    // No movement (explosion)
    if (this.exploding < -8) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "orange";
    }
    ctx.beginPath();
    ctx.arc(this.pos[0] - explosion_rad, this.pos[1] - explosion_rad,
      explosion_rad, 0, 2 * Math.PI);
    ctx.fill();
  }
}
Classes.Projectile.prototype.move = function() {
  // If exploding, animate for a bit before disappearing
  if (this.exploding < 0) {
    this.exploding--;
  } else {
    // Obstacles
    for (var j = 0; j < State.obstacles.length; j++) {
      var ob = State.obstacles[j];
      if (Classes.isCollision(this, ob)) {
        this.exploding = -1;
        this.velocity = [0, 0];
      }
    }

    // Enemies
    for (var j = 0; j < State.enemies.length; j++) {
      var ob = State.enemies[j];
      if(Classes.isCollision(this, ob)) {
        ob.health -= Constants.PLAYER_ATK;
        this.exploding = -1;
        this.velocity = [0, 0];
      }
    }

    // Update position
    this.pos[0] = Math.round(this.pos[0] +
      (Constants.PROJ_SPEED * this.velocity[0]));
    this.pos[1] = Math.round(this.pos[1] +
      (Constants.PROJ_SPEED * this.velocity[1]));
  }
}

/////////////////////////////
// Util
/////////////////////////////
Classes.isCollision = function isCollision(actor, obstacle) {
  /* establish corner points of actor and obstacle */
  var ax1 = actor.pos[0];
  var ax2 = actor.pos[0] + actor.width;
  var ay1 = actor.pos[1];
  var ay2 = actor.pos[1] + actor.height;

  var ox1 = obstacle.pos[0];
  var ox2 = obstacle.pos[0] + obstacle.width;
  var oy1 = obstacle.pos[1];
  var oy2 = obstacle.pos[1] + obstacle.height;

  return (ax1 <= ox2 &&
          ax2 >= ox1 &&
          ay1 <= oy2 &&
          ay2 >= oy1);
}

/////////////////////////////
// Specific Enemies
/////////////////////////////
// Specific move() and render() functions for enemies
// Spider type enemy
Classes.spider_render = function() {
  if (this.health > 25) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "pink";
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  // right legs
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .8), this.pos[1] + (this.height * .2));
  ctx.lineTo(this.pos[0] + (this.width * (.8 + this.state * .1)),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + this.width * .9, this.pos[1] + (this.height * .3));
  ctx.lineTo(this.pos[0] + this.width * (.9 + this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .7), this.pos[1] + (this.height * .8));
  ctx.lineTo(this.pos[0] + (this.width * .6), this.pos[1] + (this.height * .8));
  
  // left legs
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .2), this.pos[1] + this.height * .2);
  ctx.lineTo(this.pos[0] + this.width * (.2 - this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .1), this.pos[1] + (this.height * .3));
  ctx.lineTo(this.pos[0] + this.width * (.1 - this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .3), this.pos[1] + (this.height * .8));
  ctx.lineTo(this.pos[0] + (this.width * .4), this.pos[1] + (this.height * .8));
  ctx.stroke();
  
  // body
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2),
    this.width / 4, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.stroke();
  
  // eyes
  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width * .4), this.pos[1] + (this.height * .6),
    this.width * .05, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width * .6), this.pos[1] + (this.height * .6),
    this.width * .05, 0, 2 * Math.PI, true);
  ctx.fill();
}
Classes.wspider_render = function() {
  if (this.health > 25) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "pink";
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  
  // right legs
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .8), this.pos[1] + (this.height * .2));
  ctx.lineTo(this.pos[0] + this.width * (.8 + (this.state * .1)),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .9), this.pos[1] + (this.height * .3));
  ctx.lineTo(this.pos[0] + this.width * (.9 + this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .7), this.pos[1] + (this.height * .8));
  ctx.lineTo(this.pos[0] + (this.width * .6), this.pos[1] + (this.height * .8));
  
  // left legs
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height/2));
  ctx.lineTo(this.pos[0] + (this.width * .2), this.pos[1] + (this.height * .2));
  ctx.lineTo(this.pos[0] + this.width * (.2 - this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .1), this.pos[1] + (this.height * .3));
  ctx.lineTo(this.pos[0] + this.width * (.1 - this.state * .1),
    this.pos[1] + (this.height * .9));
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * .3), this.pos[1] + (this.height * .8));
  ctx.lineTo(this.pos[0] + (this.width * .4), this.pos[1] + (this.height * .8));
  ctx.stroke();
  
  // body
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2),
    this.width / 4, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.stroke();
  
  // eyes
  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width * .4), this.pos[1] + (this.height * .6),
    this.width * .05, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width * .6), this.pos[1] + (this.height * .6),
  this.width * .05, 0, 2 * Math.PI, true);
  ctx.fill();
}

Classes.spider_move = function() {
  this.state = !this.state;
  this.max_speed = Constants.SPIDER_SPEED;
  this.max_accel = Constants.SPIDER_ACCEL;

  if (Math.random() < 0.2) {
    this.accel[0] += Math.random() * this.max_speed;
    if (Math.random() < 0.5) {
      this.accel[0] *= -1;
    }
    this.accel[1] += Math.random() * this.max_speed;
    if (Math.random() < 0.5) {
      this.accel[1] *= -1;
    }
  }

  if (Math.random() < 0.1) {
    if (this.pos[0] - State.player.pos[0] < 0) { // player is to the right
      this.accel[0] = Math.abs(this.accel[0]);
    } else {
      this.accel[0] = -1 * Math.abs(this.accel[0]);
    }
    if (this.pos[1] - State.player.pos[1] < 0) { // player is below
      this.accel[1] = Math.abs(this.accel[1]);
    } else {
      this.accel[1] = -1 * Math.abs(this.accel[1]);
    }
  }

  if (this.pos[0] < (Constants.WALL_WIDTH + 5)) {
    this.accel[0] = Math.abs(this.max_accel);
  }
  if (this.pos[0] > (canvas.width - Constants.WALL_WIDTH - 5)) {
    this.accel[0] = -1 * Math.abs(this.max_accel);
  }
  if (this.pos[1] < (Constants.WALL_WIDTH + 5)) {
    this.accel[1] = Math.abs(this.max_accel);
  }
  if (this.pos[1] > (canvas.height - Constants.WALL_WIDTH - 5)) {
    this.accel[1] = -1 * Math.abs(this.max_accel);
  }

  this.velocity[0] *= Constants.VEL_DECAY;
  this.velocity[1] *= Constants.VEL_DECAY;
  this.accel[0] *= Constants.ACCEL_DECAY;
  this.accel[1] *= Constants.ACCEL_DECAY;
  this.velocity[0] += this.accel[0];
  this.velocity[1] += this.accel[1];

  for (var j = 0; j < State.obstacles.length; j++) {
    var ob = State.obstacles[j];
    if (Classes.isCollision(this, ob)) {
      var ax1 = this.pos[0];
      var ax2 = this.pos[0] + this.width;
      var ay1 = this.pos[1];
      var ay2 = this.pos[1] + this.height;

      var ox1 = ob.pos[0];
      var ox2 = ob.pos[0] + ob.width;
      var oy1 = ob.pos[1];
      var oy2 = ob.pos[1] + ob.height;

      if ((ax1 < (ox1 + (ob.width / 2))) && (this.velocity[0] > 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
      } else if ((ax1 >= (ox1 + (ob.width / 2))) && (this.velocity[0] < 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
      }

      if ((ay1 < (oy1 + (ob.height / 2))) && (this.velocity[1] > 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
      } else if ((ay1 >= (oy1 + (ob.height / 2))) && (this.velocity[1] < 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
      }
    }
  }

  // Velocity and accel to stay between this.max_speed/ACCEL and
  // -this.max_speed/ACCEL
  this.velocity[0] = Math.max(
    Math.min(this.velocity[0], this.max_speed),
    -this.max_speed);
  this.velocity[1] = Math.max(
    Math.min(this.velocity[1], this.max_speed),
    -this.max_speed);
  this.accel[0] = Math.max(
    Math.min(this.accel[0], this.max_accel),
    -this.max_accel);
  this.accel[1] = Math.max(
    Math.min(this.accel[1], this.max_accel),
    -this.max_accel);

  /* handle walls */
  var nextx = this.pos[0] + this.velocity[0];
  var nexty = this.pos[1] + this.velocity[1];
  if ((nextx < 0) || (nextx > (canvas.width - this.width))) {
    this.velocity[0] = -1 * this.damp * this.velocity[0];
  } else if ((nexty < Constants.GUI_BAR_HEIGHT) ||
             (nexty > (canvas.height - this.height))) {
    this.velocity[1] = -1 * this.damp * this.velocity[1];
  }

  // Round to avoid antialiasing (perf)
  this.pos[0] = Math.round(this.pos[0] + this.velocity[0]);
  this.pos[1] = Math.round(this.pos[1] + this.velocity[1]);
}

Classes.wspider_move = function() {
  this.state = !this.state;
  this.max_speed = 2;
  this.max_accel = 5;

  if (Math.random() < 0.8) {
    this.accel[0] += Math.random() * this.max_speed;
    this.accel[1] += Math.random() * this.max_speed;
    if (this.pos[0] - State.player.pos[0] < 0) { // player is to the right
      this.accel[0] = Math.abs(this.accel[0]);
    } else {
      this.accel[0] = -1*Math.abs(this.accel[0]);
    }
    if (this.pos[1] - State.player.pos[1] < 0) { // player is below
      this.accel[1] = Math.abs(this.accel[1]);
    } else {
      this.accel[1] = -1*Math.abs(this.accel[1]);
    }
  }

  if (this.pos[0] < (Constants.WALL_WIDTH + 5)) {
    this.accel[0] = Math.abs(this.max_accel);
  }
  if (this.pos[0] > (canvas.width - Constants.WALL_WIDTH - 5)) {
    this.accel[0] = -1 * Math.abs(this.max_accel);
  }
  if (this.pos[1] < (Constants.WALL_WIDTH + 5)) {
    this.accel[1] = Math.abs(this.max_accel);
  }
  if (this.pos[1] > (canvas.height - Constants.WALL_WIDTH - 5)) {
    this.accel[1] = -1 * Math.abs(this.max_accel);
  }

  this.velocity[0] *= Constants.VEL_DECAY;
  this.velocity[1] *= Constants.VEL_DECAY;
  this.accel[0] *= Constants.ACCEL_DECAY;
  this.accel[1] *= Constants.ACCEL_DECAY;
  this.velocity[0] += this.accel[0];
  this.velocity[1] += this.accel[1];

  for (var j = 0; j < State.obstacles.length; j++) {
    var ob = State.obstacles[j];
    if (Classes.isCollision(this, ob)) {
      var ax1 = this.pos[0];
      var ax2 = this.pos[0] + this.width;
      var ay1 = this.pos[1];
      var ay2 = this.pos[1] + this.height;

      var ox1 = ob.pos[0];
      var ox2 = ob.pos[0] + ob.width;
      var oy1 = ob.pos[1];
      var oy2 = ob.pos[1] + ob.height;

      if ((ax1 < (ox1 + (ob.width / 2))) && (this.velocity[0] > 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
      } else if ((ax1 >= (ox1 + (ob.width / 2))) && (this.velocity[0] < 0)) {
        this.velocity[0] = -1 * ob.damp * this.velocity[0];
      }

      if ((ay1 < (oy1 + (ob.height / 2))) && (this.velocity[1] > 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
      } else if ((ay1 >= (oy1 + (ob.height / 2))) && (this.velocity[1] < 0)) {
        this.velocity[1] = -1 * ob.damp * this.velocity[1];
      }
    }
  }

  // Velocity and accel to stay between this.max_speed/ACCEL and
  // -this.max_speed/ACCEL
  this.velocity[0] = Math.max(
    Math.min(this.velocity[0], this.max_speed),
    -this.max_speed);
  this.velocity[1] = Math.max(
    Math.min(this.velocity[1], this.max_speed),
    -this.max_speed);
  this.accel[0] = Math.max(
    Math.min(this.accel[0], this.max_accel),
    -this.max_accel);
  this.accel[1] = Math.max(
    Math.min(this.accel[1], this.max_accel),
    -this.max_accel);

  /* handle walls */
  var nextx = this.pos[0] + this.velocity[0];
  var nexty = this.pos[1] + this.velocity[1];
  if ((nextx < 0) || (nextx > (canvas.width - this.width))) {
    this.velocity[0] = -1 * this.damp * this.velocity[0];
  } else if ((nexty < Constants.GUI_BAR_HEIGHT) ||
             (nexty > (canvas.height - this.height))) {
    this.velocity[1] = -1 * this.damp * this.velocity[1];
  }

  // Round to avoid antialiasing (perf)
  this.pos[0] = Math.round(this.pos[0] + this.velocity[0]);
  this.pos[1] = Math.round(this.pos[1] + this.velocity[1]);
}

// Bird type enemies
Classes.bird_render = function() {
  if (this.health > 20) {
    ctx.fillStyle = "blue";
  } else {
    ctx.fillStyle = "pink";
  }

  this.state = !this.state;

  ctx.lineWidth = 1;

  // wings
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * -.1),
    this.pos[1] + (this.state * this.height * .2));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * 1.1),
    this.pos[1] + (this.state * this.height * .2));
  ctx.stroke();

  // body
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2),
    this.width / 4, 0, 2 * Math.PI, false);
  ctx.fill();
  
  // beak
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height * .6));
  ctx.lineTo(this.pos[0] + (this.width * .3), this.pos[1] + (this.height * .6));
  ctx.lineTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height * .8));
  ctx.lineTo(this.pos[0] + (this.width * .7), this.pos[1] + (this.height * .6));
  ctx.fill();
}
Classes.bird_move = function() {
  this.velocity[0] += this.accel[0];
  this.velocity[1] += this.accel[1];

  var max_speed = Constants.BIRD_SPEED;
  var max_accel = Constants.BIRD_ACCEL;

  // First try to match the player's y position
  if (Math.abs(this.pos[1] - State.player.pos[1]) > 10) {
    if (this.velocity[0] > 1) {
      this.accel[0] = -max_accel;
    } else if (this.velocity[0] < -1) {
      this.accel[0] = max_accel;
    } else {
      this.accel[0] = 0;
      if ((State.player.pos[1] - this.pos[1]) > 0) {
        this.accel[1] = max_accel;
      } else {
        this.accel[1] = -max_accel;
      }
    }
  } else {
    // Now try to match x position
    if (this.velocity[1] > 1) {
      this.accel[1] = -max_accel;
    } else if (this.velocity[1] < -1) {
      this.accel[1] = max_accel;
    } else {
      this.accel[1] = 0;
      if ((State.player.pos[0] - this.pos[0]) > 0) {
        this.accel[0] = max_accel;
      } else {
        this.accel[0] = -max_accel;
      }
    }
  }

  /* apply speed limits */
  this.velocity[0] = Math.max(
    Math.min(this.velocity[0], max_speed),
    -max_speed);
  this.velocity[1] = Math.max(
    Math.min(this.velocity[1], max_speed),
    -max_speed);
  this.accel[0] = Math.max(
    Math.min(this.accel[0], max_accel),
    -max_accel);
  this.accel[1] = Math.max(
    Math.min(this.accel[1], max_accel),
    -max_accel);

  /* handle walls */
  var nextx = this.pos[0] + this.velocity[0];
  var nexty = this.pos[1] + this.velocity[1];
  if ((nextx < 0) || (nextx > (canvas.width - this.width))) {
    this.velocity[0] = -1 * this.damp * this.velocity[0];
  } else if ((nexty < Constants.GUI_BAR_HEIGHT) ||
             (nexty > (canvas.height - this.height))) {
    this.velocity[1] = -1 * this.damp * this.velocity[1];
  }

  // Round to avoid antialiasing (perf)
  this.pos[0] = Math.round(this.pos[0] + this.velocity[0]);
  this.pos[1] = Math.round(this.pos[1] + this.velocity[1]);
}

// Bat type enemies
Classes.bat_render = function() {
  if (this.health > 20) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "pink";
  }

  this.state = !this.state;

  ctx.lineWidth = 1;

  // wings
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * -.1),
    this.pos[1] + (this.state * this.height * .2));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2));
  ctx.lineTo(this.pos[0] + (this.width * 1.1),
    this.pos[1] + (this.state * this.height * .2));
  ctx.stroke();

  // body
  ctx.beginPath();
  ctx.arc(this.pos[0] + (this.width / 2), this.pos[1] + (this.height / 2),
    this.width / 4, 0, 2 * Math.PI, false);
  ctx.fill();
}
Classes.bat_move = function() {
  this.velocity[0] += this.accel[0];
  this.velocity[1] += this.accel[1];

  var max_speed = Constants.BIRD_SPEED;
  var max_accel = Constants.BIRD_ACCEL;

  // First try to match the player's x position
  if (Math.abs(this.pos[0] - State.player.pos[0]) > 10) {
    if (this.velocity[1] > 1) {
      this.accel[1] = -max_accel;
    } else if (this.velocity[1] < -1) {
      this.accel[1] = max_accel;
    } else {
      this.accel[1] = 0;
      if ((State.player.pos[0] - this.pos[0]) > 0) {
        this.accel[0] = max_accel;
      } else {
        this.accel[0] = -max_accel;
      }
    }
  } else {
    // try to match y position
    if (this.velocity[0] > 1) {
      this.accel[0] = -max_accel;
    } else if (this.velocity[0] < -1) {
      this.accel[0] = max_accel;
    } else {
      this.accel[0] = 0;
      if ((State.player.pos[1] - this.pos[1]) > 0) {
        this.accel[1] = max_accel;
      } else {
        this.accel[1] = -max_accel;
      }
    }
  }

  /* apply speed limits */
  this.velocity[0] = Math.max(
    Math.min(this.velocity[0], max_speed),
    -max_speed);
  this.velocity[1] = Math.max(
    Math.min(this.velocity[1], max_speed),
    -max_speed);
  this.accel[0] = Math.max(
    Math.min(this.accel[0], max_accel),
    -max_accel);
  this.accel[1] = Math.max(
    Math.min(this.accel[1], max_accel),
    -max_accel);

  /* handle walls */
  var nextx = this.pos[0] + this.velocity[0];
  var nexty = this.pos[1] + this.velocity[1];
  if ((nextx < 0) || (nextx > (canvas.width - this.width))) {
    this.velocity[0] = -1 * this.damp * this.velocity[0];
  } else if ((nexty < Constants.GUI_BAR_HEIGHT) ||
             (nexty > (canvas.height - this.height))) {
    this.velocity[1] = -1 * this.damp * this.velocity[1];
  }

  // Round to avoid antialasing (perf)
  this.pos[0] = Math.round(this.pos[0] + this.velocity[0]);
  this.pos[1] = Math.round(this.pos[1] + this.velocity[1]);
}

Window.Classes = new Classes();
