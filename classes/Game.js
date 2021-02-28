const Player = require("./Player.js");

class Game {
  constructor() {
    this.players = [];
  }
}

// Returns true if player successfully added and false if not
Game.prototype.addPlayer = function (socketID, position) {
  if (this.players.length < 2) {
    this.players.push(new Player(socketID, position));
    return true;
  } else {
    return false;
  }
};

Game.prototype.removePlayer = function (socketID) {
  this.players = this.players.filter((player) => player.id !== socketID);
};

module.exports = Game;
