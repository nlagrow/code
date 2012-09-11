/** @file state.js
 *  @brief Object which keeps track of the game state.
 *
 *  @author Lucas Ray (ltray)
 *  @author Nick LaGrow (nlagrow)
 */
function State() {}

State.actors = [];      // Contains controllable elements (the character)
State.obstacles = [];   // Contains environmental obstacles (rocks,trees)
State.enemies = [];     // Contains enemies (can hurt player, can be destroyed)
State.projectiles = []; // Contains projectiles (hurts enemies)
State.player;           // The actual Player object
State.score;            // Current player score
State.timer;            // Keeps track of time
State.time;             // The actual amount of time passed in the game
State.respawnTimer;     // Timer to kep track of eney respawns

Window.State = new State();
