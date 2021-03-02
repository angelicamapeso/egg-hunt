const Game = require("./classes/Game");
const Shape = require("./classes/Shape.js");
const {
  FULL_ROOM,
  JOIN,
  GAME_OBJECT,
  ADD_PLAYER,
  UPDATE_POSITION,
  UPDATE_ROTATION,
  REMOVE_PLAYER,
  STATE_CHANGE,
} = require("./socket-events.js");

// The game state for the server
// Meant to hold game object with all of game information
let game;

module.exports = function (io) {
  io.on("connection", (socket) => {
    if (!game) {
      game = new Game();
    }

    socket.on(JOIN, (position, rotation) => {
      const newPlayer = game.addPlayer(socket.id, position, rotation);
      if (newPlayer) {
        socket.join("game-room");

        // send game object to socket that just joined
        io.to(socket.id).emit(GAME_OBJECT, game);

        // tell other sockets that there's a new player
        socket.to("game-room").emit(ADD_PLAYER, newPlayer);

        if (game.players.length == 2) {
          game.state = "ready";
          io.to("game-room").emit(STATE_CHANGE, "ready");
        }

        console.log("Added player:\n", game);
      } else {
        io.to(socket.id).emit(FULL_ROOM);
      }
    });

    socket.on(UPDATE_POSITION, (position) => {
      const player = game.players.find((player) => player.id === socket.id);
      if (player) {
        player.updatePosition(position);

        // tell other sockets that the other player has moved
        socket.to("game-room").emit(UPDATE_POSITION, player);
      }
    });

    socket.on(UPDATE_ROTATION, (rotation) => {
      const player = game.players.find((player) => player.id === socket.id);
      if (player) {
        player.updateRotation(rotation);

        // tell other sockets that player has rotated
        socket.to("game-room").emit(UPDATE_ROTATION, player);
      }
    });

    socket.on(STATE_CHANGE, (state) => {
      const validStates = ["lobby", "ready", "playing"];
      if (validStates.includes(state)) {
        game.state = state;
        switch (game.state) {
          case "playing":
            // generate random positions for "eggs"
            // generate random positions for larger objects
            // attach to game object, and send
            const envObjects = generateEnvObjects();
            game.envObjects = envObjects;
            io.to("game-room").emit(STATE_CHANGE, "playing", envObjects);
            break;
          default:
            console.log("State not implemented!");
        }
      } else {
        console.log("Invalid state sent!");
      }
    });

    socket.on("disconnect", () => {
      const removedPlayer = game.removePlayer(socket.id);

      // tell other sockets that a player has left the game
      socket.to("game-room").emit(REMOVE_PLAYER, removedPlayer);

      if (game.players.length < 2) {
        game.reset();
        io.to("game-room").emit(STATE_CHANGE, "lobby");
      }

      console.log("Removed player:\n", game);
    });
  });
};

/* Helper functions*/
const ENV_OBJ_COUNT = 50;
function generateEnvObjects() {
  const shapeArray = [];
  for (let i = 0; i < ENV_OBJ_COUNT; i++) {
    shapeArray.push(Shape.generateRandomShape(i));
  }
  return shapeArray;
}
