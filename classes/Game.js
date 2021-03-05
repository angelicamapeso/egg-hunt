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
    this.envObjects = [];
    this.eggs = [];

    // used for setting time intervals
    this.interval = undefined;
    // used to increment from interval
    // in miliseconds
    this.time = 0;
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

Game.prototype.reset = function (state) {
  this.state = state;
  this.envObjects = [];
  this.eggs = [];
  for (player of this.players) {
    player.points = 0;
  }
};

Game.prototype.getWinner = function () {
  let winner = this.players[0];
  for (let i = 1; i < this.players.length; i++) {
    if (player.points > winner.points) {
      winner = player;
    }
  }
  return winner;
};

// interval time and end time must be in miliseconds
Game.prototype.startInterval = function (
  intervalTime,
  endTime,
  intervalCallback,
  endCallback
) {
  this.time = endTime;
  this.interval = setInterval(() => {
    intervalCallback();
    this.time -= 1;
    if (this.time <= 0) {
      this.time = 0;
      this.interval = clearInterval(this.interval);
      endCallback();
    }
  }, intervalTime);
};

module.exports = Game;
