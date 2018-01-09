Controls:
SPACE - Fly 
UP ARROW - Move Forward
DOWN ARROW - Move Backward
LEFT ARROW - Turn Left
RIGHT ARROW - Turn Right


Completed Features:
Avatar -
        The user should be able to move a vehicle or character (the avatar) with the keyboard and/or the mouse.


Sunshine (requires Highlander) - 
        A single non-vertical directional light source should illuminate your game world.


Highlander (requires Sunshine or Spotlight) -
        There should be at least one object with diffuse (Lambertian) shading, possibly combined with texturing.


Shining (requires Highlander, and Sunshine or Spotlight) -
        There should be at least one object with specular (diffuse + Phong-Blinn) shading, possibly combined with texturing.


Spotlight (requires Avatar and Highlander) -
        There should be at least one point light source fixed to the avatar. The point light should not be isotropic, but emit the largest intensity of light along a main direction, and fall off for directions further away from it. The spotlight should move along with the avatar as it moves and rotates.


The Matrix Revolutions (Avatar recommended) -
        The avatar, or some other prominent, moving object, should have at least one rotating part (wheel, propeller, rotor etc.).


Ground Zero -
        There should be a large (possibly infinite) ground plane, with some tileable texture repeated on it indefinitely.


Keep Watching (requires Avatar) -
        Implement a helicam. The camera should always look at the avatar, or at the point where the avatar is immediately heading (position + velocity * something). The distance from the avatar needs to be kept reasonably constant.


Tracking -
        Make the camera move to produce a tracking shot. When holding down key 'T', the camera should move along a path (e.g. a heart curve).


Dead Solid Perfect -
        Have at least one object with procedural solid texturing (e.g. wood or marble)---i.e. the pixel shader should compute color from world space position using some formula.