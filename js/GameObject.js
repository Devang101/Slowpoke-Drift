"use strict";
let GameObject = function(mesh) {
  this.mesh = mesh;
  this.shouldRemove = false;
  this.parent = null;
  this.type = null;
  this.ahead = new Vec3(0,0,0);
  this.position = new Vec3(0, 0, 0);
  this.orientation = new Vec4(0, 0, 1, 0);
  this.scale = new Vec3(1, 1, 1);
  this.modelMatrix = new Mat4();

  this.move = function(){};
	this.control = function(){};
	this.force = new Vec3(0,0,0);
	this.torque = 0;
	this.momentum = new Vec3(0,0,0);
	this.invMass = 1;
	this.backDrag = 1;
	this.sideDrag = 1;
	this.invAngularMass = 1;
	this.angularMomentum = 0;
	this.angularDrag = 1;
};

GameObject.prototype.updateModelMatrix = function(){
  this.modelMatrix.set();
  	this.modelMatrix.scale(this.scale).rotate(this.orientation.x, this.orientation.yzw).translate(this.position);
    if(this.parent != null){
    this.modelMatrix.mul(this.parent.modelMatrix);
  }
};

GameObject.prototype.draw = function(camera, lightSources){

  this.updateModelMatrix();
  Material.modelMatrix.set(this.modelMatrix);
  Material.modelMatrixInverse.set(this.modelMatrix).invert();
  Material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);

  for(var i=0; i<lightSources.length; i++){
        Material.lightPos.at(i).set(lightSources[i].lightPos);
        Material.lightPowerDensity.at(i).set(lightSources[i].lightPowerDensity);
        Material.spotlightDir.at(i).set(lightSources[i].spotlightDir);
    }

  this.mesh.draw();

};
