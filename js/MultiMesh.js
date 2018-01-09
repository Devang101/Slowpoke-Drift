let MultiMesh = function(
    gl, jsonModelFileUrl, materials) {
  this.meshes = [];

  let request = new XMLHttpRequest();
  request.open("GET", jsonModelFileUrl);
  let theMultiMesh = this;
  request.onreadystatechange = function () {
     if (request.readyState == 4) {
       let meshesJson = JSON.parse(request.responseText).meshes;
       for (let i = 0; i < meshesJson.length; i++) {
         theMultiMesh.meshes.push( new Mesh(new TexturedIndexedTrianglesGeometry(gl, meshesJson[i]), materials[i]));
       }
     }
  };
  request.send();
};

MultiMesh.prototype.draw = function(gl){
  for (let i = 0; i < this.meshes.length; i++) {
    this.meshes[i].draw(gl);
  }
};

MultiMesh.prototype.setUniform = function(uniformName, uniformValue) {
  for (var i = 0; i < this.meshes.length; i++) {
    this.meshes[i].material[uniformName].set(uniformValue);
  }
}
