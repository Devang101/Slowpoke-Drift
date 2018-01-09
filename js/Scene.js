"use strict";
let Scene = function(gl) {
  gl.enable(gl.DEPTH_TEST);

  //shaders
  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.vs3DTrans = new Shader(gl, gl.VERTEX_SHADER, "3DTrans_vs.essl");
  this.fs3DTrans = new Shader(gl, gl.FRAGMENT_SHADER, "3DTrans_fs.essl");
  this.vsProced = new Shader(gl, gl.VERTEX_SHADER, "proced_vs.essl");
  this.fsProced = new Shader(gl, gl.FRAGMENT_SHADER, "proced_fs.essl");

  //programs
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);
  this.Trans3DProgram = new TexturedProgram(gl, this.vs3DTrans, this.fs3DTrans);
  this.procedProgram = new TexturedProgram(gl, this.vsProced, this.fsProced);

  //create materials
  this.carMaterial = new Material(gl, this.Trans3DProgram);
  this.treeMaterial = new Material(gl, this.Trans3DProgram);
  this.slowpokeMaterial = new Material(gl, this.Trans3DProgram);
  this.slowpokeEyeMaterial = new Material(gl, this.Trans3DProgram);
  this.bulletMaterial = new Material(gl, this.procedProgram);

  //set textures
    //car textures
    this.carTexture = new Texture2D(gl, "chevy/chevy.png");
    this.carMaterial.colorTexture.set(this.carTexture);

    //Tree textures
    this.treeTexture = new Texture2D(gl, "tree.png");
    this.treeMaterial.colorTexture.set(this.treeTexture);

    //slowpoke textures
    this.slowpokeTexture= new Texture2D(gl, "slowpoke/YadonDh.png");
    this.slowpokeMaterial.colorTexture.set(this.slowpokeTexture);

    this.slowpokeEyeTexture = new Texture2D(gl, "slowpoke/YadonEyeDh.png");
    this.slowpokeEyeMaterial.colorTexture.set(this.slowpokeEyeTexture);

  //create meshes
    //car and wheel meshes
    this.carMultiMaterial = [this.carMaterial];
    this.carMultiMesh = new MultiMesh(gl, "chevy/chassis.json", this.carMultiMaterial);
    this.multiwheelMesh = new MultiMesh(gl, "chevy/wheel.json", this.carMultiMaterial);

    //tree meshes
    this.treeMultiMaterial = [this.treeMaterial];
    this.treeMultiMesh = new MultiMesh(gl, "tree.json", this.treeMultiMaterial);

    //slowpoke meshes
    this.slowpokeMultiMaterial = [this.slowpokeMaterial,this.slowpokeEyeMaterial];
    this.slowpokeMultiMesh = new MultiMesh(gl, "slowpoke/Slowpoke.json", this.slowpokeMultiMaterial);

    //create bullet meshes
    this.bulletMultiMaterial = [this.bulletMaterial];
    this.bulletMultiMesh = new MultiMesh(gl, "balloon/balloon.json", this.bulletMultiMaterial);

  //camera
  this.camera = new PerspectiveCamera();
  this.camera.position = new Vec3(0,0,0);

  //genericMove
  this.genericMove = function(t, dt){
  this.orientation.x += dt * this.angularMomentum * this.invAngularMass;
  this.angularMomentum *= Math.pow(this.angularDrag,dt);

  this.position.addScaled(dt * this.invMass,this.momentum);
  this.ahead = new Vec3(Math.sin(this.orientation.x), 0,Math.cos(this.orientation.x)).direction();
  let momAhead = this.ahead.times(this.ahead.dot(this.momentum));
  let momSide = this.momentum.minus(momAhead);
  momSide.mul(Math.pow(this.sideDrag, dt));
  momAhead.mul(Math.pow(this.backDrag, dt));
  this.momentum.set().add(momAhead).add(momSide);

  this.momentum.addScaled(dt, this.force);
  this.angularMomentum += dt * this.torque;
};

  this.timeAtLastFrame = new Date().getTime();
  this.gameObjects = [];
  this.score = 0;

  //create car
  this.car = new GameObject(this.carMultiMesh);
  this.car.type = "car";
  this.car.isAlive = true;
  this.car.scale = new Vec3(.2,.2,.2);
  this.car.position = new Vec3(0,0,0);
  this.car.orientation.yzw = new Vec3(0,1,0);
  this.car.backDrag = 0.5;
  this.car.sideDrag = 0.5;
  this.car.angularDrag = 0.01;
  this.car.control = function(t, dt, keysPressed, gameObjects, carPosition){
    let thrust = 40;
    this.force = new Vec3(0,0,0);
    this.torque = 0;
    if(keysPressed.LEFT){
      this.torque += 5;
    }
    if(keysPressed.RIGHT){
      this.torque -= 5;
    }
    if(keysPressed.UP){
      this.force = this.ahead.times(thrust);
    }
    if(keysPressed.DOWN){
      this.force = this.ahead.times(-thrust);
    }
    let xMax = carPosition.x + 4;
    let xMin = carPosition.x - 4;
    let zMax = carPosition.z + 4;
    let zMin = carPosition.z - 4;
    for (var i = 0; i < gameObjects.length; i++) {
      if(gameObjects[i].type == "slowpoke"){
        let slowXMax = gameObjects[i].position.x + 4;
        let slowXMin = gameObjects[i].position.x - 4;
        let slowZMax = gameObjects[i].position.z + 4;
        let slowZMin = gameObjects[i].position.z - 4;

        if(
          ((xMax <= slowXMax && xMax >= slowXMin) ||
          (xMin >= slowXMin && xMin <= slowXMax)) &&
          ((zMax <= slowZMax && zMax >= slowZMin) ||
          (zMin >= slowZMin && zMin <= slowZMax))){
            this.control = function(){};
            this.move = function(){};
            this.isAlive = false;
          }
      }
    }
  };
  this.car.move = this.genericMove;
  this.gameObjects.push(this.car);

  //create wheels
  //Wheel GameObjects
  this.wheelFrontL = new GameObject(this.multiwheelMesh);
  this.wheelFrontR = new GameObject(this.multiwheelMesh);
  this.wheelBackL = new GameObject(this.multiwheelMesh);
  this.wheelBackR = new GameObject(this.multiwheelMesh);
  this.wheelFrontL.parent = this.car;
  this.wheelFrontR.parent = this.car;
  this.wheelBackL.parent = this.car;
  this.wheelBackR.parent = this.car;
  this.wheelFrontL.position = new Vec3(-7,-2.5,13.7);
  this.wheelFrontR.position = new Vec3(7,-2.5,13.7);
  this.wheelBackL.position = new Vec3(-7,-2.5,-10.8);
  this.wheelBackR.position = new Vec3(7,-2.5,-10.8);
  this.wheelFrontR.orientation.x = 3.14;
  this.wheelBackR.orientation.x = 3.14;
  this.wheelFrontR.orientation.yzw = new Vec3(1,0,0);
  this.wheelBackR.orientation.yzw = new Vec3(1,0,0);
  this.wheelFrontL.orientation.yzw = new Vec3(1,0,0);
  this.wheelBackL.orientation.yzw = new Vec3(1,0,0);
  this.wheelFrontL.type = "wheel";
  this.wheelFrontR.type = "wheel";
  this.wheelBackL.type = "wheel";
  this.wheelBackR.type = "wheel";
  this.wheelFrontL.position = new Vec3(-7,-2.5,13.7);
  this.wheelFrontR.position = new Vec3(7,-2.5,13.7);
  this.wheelBackL.position = new Vec3(-7,-2.5,-10.8);
  this.wheelBackR.position = new Vec3(7,-2.5,-10.8);
  this.wheelFrontL.angularDrag = 0.5;
  this.wheelFrontR.angularDrag = 0.5;
  this.wheelBackL.angularDrag = 0.5;
  this.wheelBackR.angularDrag = 0.5;
  let rotateWheels = function(t, dt, keysPressed, gameObjects, carPosition){
    this.torque = 0;
    if(keysPressed.UP){
      this.torque += 10;
    }
    if(keysPressed.DOWN){
      this.torque -= 10;
    }
  };
  this.wheelFrontL.control = rotateWheels;
  this.wheelFrontR.control = rotateWheels;
  this.wheelBackL.control = rotateWheels;
  this.wheelBackR.control = rotateWheels;
  this.wheelFrontL.move = this.genericMove;
  this.wheelFrontR.move = this.genericMove;
  this.wheelBackL.move = this.genericMove;
  this.wheelBackR.move = this.genericMove;
  this.gameObjects.push(this.wheelFrontL,this.wheelFrontR, this.wheelBackR, this.wheelBackL);

  //create ground
    this.groundGeometry = new TexturedQuadGeometry(gl);
    //Texture
    this.groundTexture = new Texture2D(gl, "ground.png");
    this.groundMaterial = new Material(gl,this.textureProgram);
    this.groundMaterial.colorTexture.set(this.groundTexture);
    //Mesh
    this.groundMesh = new Mesh(this.groundGeometry, this.groundMaterial);
    this.ground = new GameObject(this.groundMesh);
    this.ground.type = "ground";
    this.ground.position = new Vec3(0,-2,0);
    this.ground.scale = new Vec3(1000,1000,1000);
    this.ground.orientation.yzw = new Vec3(1,0,0);
    this.ground.orientation.x = 3.14/2;
    this.gameObjects.push(this.ground);

  //Light sources
  this.sun = new LightSource();
  this.sun.lightPos = new Vec4(5.0,5.0,5.0,0.0);
  this.sun.lightPowerDensity = new Vec4(2.3,2.3,2.3,0.0);

  this.spotlight = new LightSource();
  this.spotlight.lightPos = new Vec4(this.car.position,1.0).plus(new Vec4(0,5,0,0));
  this.spotlight.lightPowerDensity = new Vec4(50.0,50.0,0.0,0.0);
  this.spotlight.spotlightDir = new Vec4(0,-1,0,0);

  this.lightSources = [this.sun, this.spotlight];

  this.totalSlowpokes = 30;
  this.slowPokesAlive = 30;

  //create slowpokes
  this.createSlowpokes = function() {
    for (var i = 0; i < this.totalSlowpokes; i++) {
      var randomX = Math.floor(Math.random() * 2001) -1000;
      var randomZ = Math.floor(Math.random() * 2001) -1000;
      var slowpoke = new GameObject(this.slowpokeMultiMesh);
      slowpoke.type = "slowpoke";
      slowpoke.position = new Vec3(randomX,0,randomZ);
      slowpoke.orientation.yzw = new Vec3(0,1,0);
      slowpoke.angularDrag = 0.5;
      slowpoke.backDrag = 0.3;
      slowpoke.sideDrag = 0.3;
      slowpoke.gotShot = function(bullet){
        if(bullet.position.x < this.position.x + 4 &&
           bullet.position.x >= this.position.x - 4 &&
           bullet.position.z < this.position.z + 4 &&
           bullet.position.z >= this.position.z - 4){
             this.shouldRemove = true;
             bullet.shouldRemove = true;
           }
      };
      slowpoke.control = function(t, dt, keysPressed, gameObjects, carPosition){
        let directionToFace = (carPosition.minus(this.position)).direction();
        let rotate90 = this.ahead.cross(new Vec3(0,-1,0));
        let turnAngle = rotate90.dot(directionToFace);
        let thrust = 30;
        this.force = this.ahead.times(thrust);
        this.orientation.x += turnAngle;
      };
      slowpoke.move = this.genericMove;
      this.gameObjects.push(slowpoke);
    }
  };
  this.createSlowpokes();

  //trees
  for(var i=0; i<40; i++){
    var randomX = Math.floor(Math.random() * 2001) -1000;
    var randomZ = Math.floor(Math.random() * 2001) -1000;
    var randomOrientation = Math.floor(Math.random() * 361);
    var tree = new GameObject(this.treeMultiMesh);
    tree.type = "tree"
    tree.scale = new Vec3(.4,.4,.4);
    tree.position = new Vec3(randomX,0,randomZ);
    this.gameObjects.push(tree);
  }

  this.onmousedown = function() {
    this.camera.mouseDown();
  };
  this.onmouseup = function(){
    this.camera.mouseUp();
  };

  this.onmousemove = function(event){
    this.camera.mouseMove(event);
  };
};

Scene.prototype.update = function(gl, keysPressed, overlay) {
  //jshint bitwise:false
  //jshint unused:false

  // clear the screen
  gl.clearColor(0.3, 0.4, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  if(this.slowPokesAlive <= 0){
    this.totalSlowpokes = Math.floor(this.totalSlowpokes*1.5);
    this.slowPokesAlive = this.totalSlowpokes;
    this.createSlowpokes();
  }

  if(this.car.position.x>1000){
    this.car.position.x = 1000;
  }
  if(this.car.position.x<-1000){
    this.car.position.x = -1000;
  }
  if(this.car.position.z>1000){
    this.car.position.z = 1000;
  }
  if(this.car.position.z<-1000){
    this.car.position.z = -1000;
  }

  for (let i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].control(timeAtThisFrame, dt, keysPressed, this.gameObjects, this.car.position);
    if(this.gameObjects[i].shouldRemove){
      let removed = this.gameObjects.splice(i,1);
      if(removed[0].type == "slowpoke"){
        this.slowPokesAlive--;
        this.score++;
      };
      i--;
    }
  }

  for (let i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].move(timeAtThisFrame, dt);
  }

  if(keysPressed.SPACE){
    //create bullet
    let canShoot = true;
    for (var i = 0; i < this.gameObjects.length; i++) {
      if(this.gameObjects[i].type == "bullet"){
        canShoot = false;
      };
    }
    if(canShoot && this.car.isAlive){
      let bullet = new GameObject(this.bulletMultiMesh);
      bullet.type = "bullet";
      bullet.scale = new Vec3(0.01,0.01,0.01);
      bullet.position = new Vec3(this.car.position).plus(new Vec3(0,3,0));
      bullet.ahead = new Vec3(this.car.ahead);
      let thrust = 1000;
      bullet.force = new Vec3(bullet.ahead.times(thrust));
      bullet.control  = function(t, dt, keysPressed, gameObjects, carPosition){
        if(Math.abs(this.position.x) > 1000 || Math.abs(this.position.z)>1000){
          this.shouldRemove = true;
        }
        for (var i =0; i<gameObjects.length; i++) {
          if(gameObjects[i].gotShot !== undefined){
            gameObjects[i].gotShot(bullet);
          }
        }
      };
      bullet.move = this.genericMove;
      this.gameObjects.push(bullet);
    }
  }

  this.updateSpotlight();
  this.updateCamera(dt, keysPressed);
  overlay.innerHTML = "Score: " + this.score;

  if(!this.car.isAlive){
    overlay.innerHTML = "GAME OVER! Score: " + this.score;
  }
  
  for (var i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].draw(this.camera, this.lightSources);
    }
};

Scene.prototype.updateCamera = function(dt, keysPressed){

    if(keysPressed.T){
      this.camera.position = new Vec3(
        this.car.position.x + 10*Math.cos(this.timeAtLastFrame/1000),
        this.car.position.y + 3,
        this.car.position.z + 10*Math.sin(this.timeAtLastFrame/1000));
      this.camera.ahead = this.car.position.minus(this.camera.position);
      this.camera.ahead.normalize();
      this.camera.right = this.camera.ahead.cross(this.camera.up);
      this.camera.updateViewMatrix();
    }
    else{
      this.camera.position = new Vec3(this.car.position).minus(new Vec3(this.car.ahead).mul(15));
      this.camera.position.y += 5;
      this.camera.ahead = this.car.ahead;
      this.camera.up = new Vec3(0,1,0);
      this.camera.right = this.camera.ahead.cross(this.camera.up);
      this.camera.updateViewMatrix();
  }
}

Scene.prototype.updateSpotlight = function(){
    this.spotlight.lightPos = new Vec4(this.car.position,1.0).plus(new Vec4(0,5,0,0));
    this.lightSources[1] = this.spotlight;
}
