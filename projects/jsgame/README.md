15237
=====
Group Members:
-Lucas Ray (LTRAY)
-Nick LaGrow (NLAGROW)

How to play:
  You can control movement of the character with the W, A, S, and D keys (where
A is left, W is up, D is right, and S is down). Your player can shoot by using
the arrow keys (the player can only be shooting in 1 direction at a time).

  As you progress through the game, it increases in difficulty. New types of
enemies will spawn as you reach 11, 21, and 31 points. The number of enemies
that spawn will also increase as you do better.

Ideas implemented:
  We started our game not knowing exactly what form it would take, so focus was
put into creating a generic game engine/players/enemies/obstacles. For this
reason, we made heavy use of objects. The "Actor" object (in classes.js)
represents any object which might move. Both the "Player" and "Enemy" objects
are subclasses of Actors. Actor methods are always to be overridden, but
includes a default render() function in its prototype to help with debugging.
  We also wanted to allow for quick and easy creation of new enemies. So, our
Enemy object takes in a render() and move() as arguments to its constructor,
allowing the developer to easily add an enemy that looks any way they want
(via render()), and acts in any way they want (the AI behind enemy movement lies
within move()).
  We implemented smarter keyDown events by also including a keyUp event and
repeating an action (movement or shooting) if the appropriate key(s) is down.
  Finally, we opted to use requestAnimationFrame to run our main game loop.
requestAnimationFrame is fairly new and allows for smarter use of computer
resources (it aims to maintain ~60 fps in the foreground, and much lower when
in the background).
