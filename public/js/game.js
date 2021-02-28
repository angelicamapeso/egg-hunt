/* Component manages game state */
AFRAME.registerComponent("game", {
  init: function () {
    const el = this.el;
    this.socket = socket;

    // update game state
    this.game = null;
    this.player2 = null;

    this.createPlayer2 = () => {
      this.player2 = document.createElement("a-entity");
      this.player2.setAttribute("player2", "");
      el.appendChild(this.player2);
    };

    this.setGameObject = (game) => {
      this.game = game;

      // there are now two players, so must draw the other player upon joining
      if (this.game.players.length > 1) {
        this.createPlayer2();
      }
    };

    // for the case where player is alone and another player joins
    this.addPlayer = (newPlayer) => {
      if (this.game) {
        if (!this.game.players.find((player) => player.id === newPlayer.id)) {
          this.game.players.push(newPlayer);

          // new player is the second player
          if (newPlayer.id !== socket.id) {
            this.createPlayer2();
          }
        }
      }
    };

    // hide scene
    this.hideScene = () => {
      el.style.display = "none";
    };

    this.socket.on("game-object", this.setGameObject);
    this.socket.on("add-player", this.addPlayer);
    this.socket.on("full-room", this.hideScene);
  },
});
