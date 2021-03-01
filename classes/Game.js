const Player = require("./Player.js");

class Game {
  constructor() {
    this.players = [];
    /* Controls the state of the game */
    /* 
      "lobby" = waiting for players
      "ready" = 2 players currently in game
      "playing" = game currently running
      "ended" = game has ended
    */
    this.state = "lobby";
  }
}

// Returns true if player successfully added and false if not
Game.prototype.addPlayer = function (socketID, position, rotation) {
  let newPlayer = null;
  if (this.players.length < 2) {
    newPlayer = new Player(socketID, position, rotation);
    this.players.push(newPlayer);
  }
  return newPlayer;
};

Game.prototype.removePlayer = function (socketID) {
  const playerToRemove = this.players.find((player) => player.id === socketID);
  this.players = this.players.filter((player) => player.id !== socketID);
  return playerToRemove;
};

module.exports = Game;
