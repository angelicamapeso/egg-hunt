const Game = require("./classes/Game");

// The game state for the server
// Meant to hold game object with all of game information
let game;

module.exports = function (io) {
  io.on("connection", (socket) => {
    if (!game) {
      game = new Game();
    }

    socket.on("join", (position) => {
      const wasAdded = game.addPlayer(socket.id, position);
      if (wasAdded) {
        socket.join("game-room");
        socket.to("game-room").emit("update-game", JSON.stringify(game));
        console.log("Added player", game);
      } else {
        io.to(socket.id).emit("full-room");
      }
    });

    socket.on("update-position", (position) => {
      const player = game.players.find((player) => player.id === socket.id);
      if (player) {
        player.updatePosition(position);
        socket.to("game-room").emit("update-game", JSON.stringify(game));
      }
    });

    socket.on("disconnect", () => {
      game.removePlayer(socket.id);
      console.log("Removed player", game);
    });
  });
};
