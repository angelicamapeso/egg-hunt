class Player {
  constructor(socketID, position) {
    this.id = socketID;
    // position is the player's 3D position in space - [x, y, z]
    this.position = position;
  }
}

Player.prototype.updatePosition = function (newPosition) {
  this.position = newPosition;
};

module.exports = Player;
