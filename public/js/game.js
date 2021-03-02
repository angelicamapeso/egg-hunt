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

    // Binding
    this.handleLobbyState = this.handleLobbyState.bind(this);
    this.handleReadyState = this.handleReadyState.bind(this);
    this.handlePlayingState = this.handlePlayingState.bind(this);

    // websocket listeners
    this.socket.on(GAME_OBJECT, this.setGameObject.bind(this));
    this.socket.on(ADD_PLAYER, this.addPlayer.bind(this));
    this.socket.on(REMOVE_PLAYER, this.removePlayer.bind(this));
    this.socket.on(FULL_ROOM, this.hideScene.bind(this));
    this.socket.on(STATE_CHANGE, this.handleStateChange.bind(this));
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

  handleStateChange: function (state, envObjects, eggs) {
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
          this.handlePlayingState(envObjects, eggs);
          break;
        default:
          console.log("Invalid state entered!");
      }
    }
  },

  handleLobbyState: function () {
    this.game.envObjects = [];
    this.game.eggs = [];

    hideElement(this.startBtnGrp);
    hideElement(this.startBtn);

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
  },

  handleReadyState: function () {
    showElement(this.startBtnGrp);
    showElement(this.startBtn);
  },

  handlePlayingState: function (envObjects, eggs) {
    // update game state
    this.game.envObjects = envObjects;
    this.envObjects = []; // element references

    this.game.eggs = eggs;
    this.eggs = []; // element references

    hideElement(this.startBtnGrp);
    hideElement(this.startBtn);

    // Create environment objects
    for (object of envObjects) {
      const entity = createShape(object);
      entity.setAttribute("dynamic-body", "");
      this.envObjects.push(entity);
      this.el.appendChild(entity);
    }

    for (egg of eggs) {
      const eggEntity = createShape(egg);
      eggEntity.setAttribute("static-body", "");
      eggEntity.setAttribute("data-id", egg.id);
      this.eggs.push(eggEntity);
      this.el.appendChild(eggEntity);
    }
  },

  // hide scene - used when max players reached
  hideScene: function () {
    this.el.style.display = "none";
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
