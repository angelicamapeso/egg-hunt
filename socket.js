const Game = require("./classes/Game");
const {
  FULL_ROOM,
  GAME_OBJECT,
  ADD_PLAYER,
  UPDATE_POSITION,
} = require("./socket-events.js");

// The game state for the server
// Meant to hold game object with all of game information
let game;

module.exports = function (io) {
  io.on("connection", (socket) => {
    if (!game) {
      game = new Game();
    }

    socket.on("join", (position) => {
      const newPlayer = game.addPlayer(socket.id, position);
      if (newPlayer) {
        socket.join("game-room");

        // send game object to socket that just joined
        io.to(socket.id).emit(GAME_OBJECT, game);

        // tell other sockets that there's a new player
        socket.to("game-room").emit(ADD_PLAYER, newPlayer);

        console.log("Added player:\n", game);
      } else {
        io.to(socket.id).emit(FULL_ROOM);
      }
    });

    socket.on("update-position", (position) => {
      const player = game.players.find((player) => player.id === socket.id);
      if (player) {
        player.updatePosition(position);
        socket.to("game-room").emit(UPDATE_POSITION, player);
      }
    });

    socket.on("disconnect", () => {
      game.removePlayer(socket.id);
      console.log("Removed player:\n", game);
    });
  });
};
