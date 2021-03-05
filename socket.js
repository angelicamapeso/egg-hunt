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
  EGG_GRAB,
  TIME_CHANGE,
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
      const validStates = [
        "lobby",
        "ready",
        "start-play",
        "playing",
        "game-over",
      ];
      if (validStates.includes(state)) {
        switch (state) {
          case "start-play":
            game.state = state;
            handleStartPlay();
            break;
          case "playing":
            game.state = state;
            handlePlaying();
            break;
          case "game-over":
            handleGameOver();
            break;
          default:
            console.log("State not implemented!");
        }
      } else {
        console.log("Invalid state sent!");
      }
    });

    socket.on(EGG_GRAB, (id) => {
      const eggID = parseInt(id);
      if (game.eggs.find((egg) => egg.id === eggID)) {
        // Remove egg from list
        game.eggs = game.eggs.filter((egg) => egg.id !== eggID);
        // give the point to the appropriate player
        const grabber = game.players.find((player) => player.id === socket.id);
        grabber.points += 1;

        // tell other sockets that egg has been grabbed
        io.to("game-room").emit(EGG_GRAB, eggID, grabber);
      }
    });

    socket.on("disconnect", () => {
      const removedPlayer = game.removePlayer(socket.id);

      // tell other sockets that a player has left the game
      socket.to("game-room").emit(REMOVE_PLAYER, removedPlayer);

      if (game.players.length < 2) {
        game.reset("lobby");
        io.to("game-room").emit(STATE_CHANGE, "lobby");
      }

      console.log("Removed player:\n", game);
    });

    /* Game state helper functions */
    function handleStartPlay() {
      io.to("game-room").emit(STATE_CHANGE, "start-play");
      const countdownFrom = 3;
      io.to("game-room").emit(TIME_CHANGE, countdownFrom);
      game.startInterval(
        1000,
        countdownFrom - 1,
        () => {
          io.to("game-room").emit(TIME_CHANGE, game.time);
        },
        handlePlaying
      );
    }

    function handlePlaying() {
      game.state = "playing";
      // generate environment objects
      game.envObjects = generateEnvObjects();

      // generate eggs
      game.eggs = generateEggs();

      for (player of game.players) {
        player.points = 0;
      }

      io.to("game-room").emit(STATE_CHANGE, "playing", {
        envObjects: game.envObjects,
        eggs: game.eggs,
      });
    }

    function handleGameOver() {
      if (game.state !== "game-over") {
        const winner = game.getWinner();
        io.to("game-room").emit(STATE_CHANGE, "game-over", { winner });
        game.reset("game-over");
      }
    }
  });
};

/* Helper functions*/
const ENV_OBJ_COUNT = 40;
function generateEnvObjects() {
  const shapeArray = [];
  for (let i = 0; i < ENV_OBJ_COUNT; i++) {
    shapeArray.push(Shape.generateRandomShape(i));
  }
  return shapeArray;
}

const EGG_COUNT = 20;
function generateEggs() {
  const eggArray = [];
  for (let i = 0; i < EGG_COUNT; i++) {
    eggArray.push(Shape.generateEgg(i));
  }
  return eggArray;
}
