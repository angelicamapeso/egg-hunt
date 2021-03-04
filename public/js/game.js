/* Component manages game state */
AFRAME.registerComponent("game", {
  init: function () {
    const el = this.el;
    this.socket = socket;

    // game state
    this.game = null;

    // reference to player 2 element
    this.player2 = null;
    this.createPlayer2 = this.createPlayer2.bind(this);

    // reference to start button element
    // Hide button
    this.startBtnGrp = document.getElementById("start-game-grp");
    this.startBtn = document.getElementById("start-game-btn");
    hideElement(this.startBtnGrp);
    hideElement(this.startBtn);

    // to ensure that points updated only once
    this.lastEggRemoved = null;

    // reference to point ui
    this.gameUI = document.getElementById("game-ui");
    this.playerPoints = document.getElementById("player-points");
    this.player2Points = document.getElementById("player2-points");
    this.winner = document.getElementById("winner");
    this.winnerText = document.getElementById("winner-text");

    // Binding
    this.handleLobbyState = this.handleLobbyState.bind(this);
    this.handleReadyState = this.handleReadyState.bind(this);
    this.handlePlayingState = this.handlePlayingState.bind(this);
    this.handleEggGrab = this.handleEggGrab.bind(this);
    this.handleGameOver = this.handleGameOver.bind(this);

    // Binding helper functions
    this.clearScene = this.clearScene.bind(this);
    this.removeEgg = this.removeEgg.bind(this);
    this.updatePoints = this.updatePoints.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.getPlayer2 = this.getPlayer2.bind(this);

    // websocket listeners
    this.socket.on(GAME_OBJECT, this.setGameObject.bind(this));
    this.socket.on(ADD_PLAYER, this.addPlayer.bind(this));
    this.socket.on(REMOVE_PLAYER, this.removePlayer.bind(this));
    this.socket.on(FULL_ROOM, this.hideScene.bind(this));
    this.socket.on(STATE_CHANGE, this.handleStateChange.bind(this));
    this.socket.on(EGG_GRAB, this.handleEggGrab);
  },

  setGameObject: function (game) {
    this.game = game;
    // there are now two players, so must draw the other player upon joining
    if (this.game.players.length > 1) {
      const otherPlayer = this.getPlayer2(game.players);
      this.createPlayer2(otherPlayer.position);
    }
  },

  // when there is only one player in game and another joins after
  addPlayer: function (newPlayer) {
    if (this.game) {
      if (!this.game.players.find((player) => player.id === newPlayer.id)) {
        this.game.players.push(newPlayer);

        // new player is the second player
        if (newPlayer.id !== socket.id) {
          this.createPlayer2(newPlayer.position);
        }
      }
    }
  },

  removePlayer: function (removedPlayer) {
    if (this.game) {
      this.game.players = this.game.players.filter(
        (player) => player.id !== removedPlayer.id
      );

      // remove the object representing player 2
      if (removedPlayer.id !== socket.id && this.player2) {
        this.player2.remove();
      }
    }
  },

  handleStateChange: function (state, obj) {
    if (this.game) {
      this.game.state = state;
      console.log("State change", state);
      /* TODO: add switch statement to do something when state changes */
      switch (this.game.state) {
        case "lobby":
          this.handleLobbyState();
          break;
        case "ready":
          this.handleReadyState();
          break;
        case "playing":
          this.handlePlayingState(obj);
          break;
        case "game-over":
          this.handleGameOver(obj);
          break;
        default:
          console.log("Invalid state entered!");
      }
    }
  },

  handleLobbyState: function () {
    this.clearScene();

    // hide game ui
    this.gameUI.style.display = "none";
  },

  handleReadyState: function () {
    showElement(this.startBtnGrp);
    showElement(this.startBtn);
  },

  handlePlayingState: function (obj) {
    this.clearScene();

    // update game state
    if (obj.envObjects) {
      this.game.envObjects = obj.envObjects;
      this.envObjects = []; // element references
    } else {
      throw new Error("Missing env objects on playing state!");
    }

    if (obj.eggs) {
      this.game.eggs = obj.eggs;
      this.eggs = []; // element references
    } else {
      throw new Error("Missing egg objects on playing state!");
    }

    hideElement(this.startBtnGrp);
    hideElement(this.startBtn);

    // show game ui
    this.gameUI.style.display = "block";
    const currentPlayer = this.getPlayer(this.game.players);
    const player2 = this.getPlayer2(this.game.players);
    this.playerPoints.textContent = currentPlayer.points;
    this.player2Points.textContent = player2.points;

    // Create environment objects
    for (object of obj.envObjects) {
      const entity = createShape(object);
      entity.setAttribute("dynamic-body", "");
      this.envObjects.push(entity);
      this.el.appendChild(entity);
    }

    for (egg of obj.eggs) {
      const eggEntity = createShape(egg);
      eggEntity.setAttribute("static-body", "");
      eggEntity.setAttribute("egg", "");
      eggEntity.setAttribute("data-id", egg.id);
      eggEntity.classList.add("egg");
      this.eggs.push(eggEntity);
      this.el.appendChild(eggEntity);
    }
  },

  handleEggGrab: function (eggID, grabber) {
    if (this.lastEggRemoved !== eggID) {
      this.updatePoints(grabber);
      this.removeEgg(eggID);
    }
  },

  handleGameOver: function (obj) {
    this.winner.style.display = "inline-block";
    this.winnerText.textContent =
      obj.winner.id === socket.id ? "You won!" : "You lost!";
    showElement(this.startBtnGrp);
    showElement(this.startBtn);
  },

  // hide scene - used when max players reached
  hideScene: function () {
    this.el.style.display = "none";
  },

  clearScene: function () {
    this.game.envObjects = [];
    this.game.eggs = [];

    if (this.envObjects && this.envObjects.length > 0) {
      for (object of this.envObjects) {
        object.remove();
      }
      this.envObjects = [];
    }

    if (this.eggs && this.eggs.length > 0) {
      for (egg of this.eggs) {
        egg.remove();
      }
      this.eggs = [];
    }

    // clear points
    for (player of this.game.players) {
      player.points = 0;
    }
    this.playerPoints.textContent = 0;
    this.player2Points.textContent = 0;

    // clear winner
    this.winner.style.display = "none";
    hideElement(this.startBtnGrp);
    hideElement(this.startBtn);
  },

  getPlayer: function (players) {
    return players.find((player) => player.id === socket.id);
  },

  // Helper functions
  getPlayer2: function (players) {
    return players.find((player) => player.id !== socket.id);
  },

  createPlayer2: function ([x, y, z]) {
    this.player2 = document.createElement("a-entity");
    this.player2.setAttribute("player2", "");
    this.player2.object3D.position.set(x, y, z);
    this.el.appendChild(this.player2);
  },

  removeEgg: function (eggID) {
    if (this.game && this.eggs) {
      const eggIDint = parseInt(eggID);
      // Remove the egg
      const eggToRemove = this.eggs.find(
        (egg) => eggIDint === parseInt(egg.dataset.id)
      );
      // Egg hasn't been removed yet
      if (eggToRemove) {
        eggToRemove.remove();
        this.eggs = this.eggs.filter(
          (egg) => parseInt(egg.dataset.id) !== eggIDint
        );
        this.game.eggs = this.game.eggs.filter((egg) => egg.id !== eggIDint);
      }

      this.lastEggRemoved = eggIDint;

      // check if game over after removing egg
      if (this.game.state !== "game-over" && this.game.eggs.length === 0) {
        this.game.state = "game-over";
        socket.emit(STATE_CHANGE, "game-over");
      }
    }
  },

  updatePoints: function (grabber) {
    // Update game state
    const playerToUpdate = this.game.players.find(
      (player) => player.id === grabber.id
    );

    // Points haven't been updating yet, so update points
    if (playerToUpdate.points < grabber.points) {
      playerToUpdate.points = grabber.points;

      // update points UI
      if (playerToUpdate.id === socket.id) {
        console.log(this.playerPoints);
        this.playerPoints.textContent = playerToUpdate.points;
      } else {
        this.player2Points.textContent = playerToUpdate.points;
      }
    }
  },
});

/* Start button*/
AFRAME.registerComponent("start-btn", {
  init: function () {
    this.handleClick = () => {
      socket.emit(STATE_CHANGE, "playing");
    };

    this.el.addEventListener("click", this.handleClick);
  },

  remove: function () {
    this.el.removeEventListener("click", this.handleClick);
  },
});

/* Egg*/
AFRAME.registerComponent("egg", {
  init: function () {
    this.player = document.getElementById("player");
    this.player2 = document.querySelector("[player2]");

    // Get current position
    this.currentPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(this.currentPosition);
  },
  // Detect when player is close
  tick: function () {
    let playerPosition = new THREE.Vector3();
    this.player.object3D.getWorldPosition(playerPosition);

    let player2Position = new THREE.Vector3();
    this.player2.object3D.getWorldPosition(player2Position);

    const distanceToPlayer = this.currentPosition.distanceTo(playerPosition);
    const distanceToPlayer2 = this.currentPosition.distanceTo(player2Position);

    const collisionThreshold = 2;

    if (
      distanceToPlayer <= collisionThreshold ||
      distanceToPlayer2 <= collisionThreshold
    ) {
      const gameComponent = document.querySelector("[game]").components.game;

      const grabber =
        distanceToPlayer <= collisionThreshold
          ? gameComponent.getPlayer(gameComponent.game.players)
          : gameComponent.getPlayer2(gameComponent.game.players);
      const updatedGrabber = { ...grabber, points: grabber.points + 1 };

      // hide egg and update local points right away
      gameComponent.handleEggGrab(this.el.dataset.id, updatedGrabber);

      // fallback if for some reason the egg wasn't removed or points
      // not updated fast enough
      if (distanceToPlayer <= collisionThreshold) {
        // send to server if this character grabbed egg
        socket.emit(EGG_GRAB, this.el.dataset.id);
      }
    }
  },
});

/* Global helper functions */
function hideElement(element) {
  element.setAttribute("visible", "false");
  if (element.classList.contains("clickable")) {
    element.classList.remove("clickable");
    element.setAttribute("data-clickable", "true");
  }
}

function showElement(element) {
  element.setAttribute("visible", "true");
  if (element.dataset.clickable) {
    element.classList.add("clickable");
  }
}

/* used to render shape from Shape.js */
function createShape(shapeObj) {
  const attributes = Object.keys(shapeObj);
  const entity = document.createElement("a-entity");
  for (attribute of attributes) {
    if (attribute !== "id" && shapeObj[attribute]) {
      entity.setAttribute(attribute, shapeObj[attribute]);
    }
  }
  return entity;
}
