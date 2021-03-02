class Player {
  constructor(socketID, position, rotation) {
    this.id = socketID;
    // position is the player's 3D position in space - [x, y, z]
    this.position = position;
    // rotation is player's quaternion rotation - [x, y, z, w]
    this.rotation = rotation;
    // points
    this.points = 0;
  }
}

Player.prototype.updatePosition = function (newPosition) {
  this.position = newPosition;
};

Player.prototype.updateRotation = function (newRotation) {
  this.rotation = newRotation;
};

module.exports = Player;
