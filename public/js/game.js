/* Component manages game state */
AFRAME.registerComponent("game", {
  init: function () {
    const el = this.el;
    this.socket = socket;

    // update game state
    this.game = null;
    this.player2 = null;
    this.updateGame = (game) => {
      this.game = JSON.parse(game);

      if (this.game.players.length > 1) {
        // Create player 2
        if (!this.player2) {
          this.player2 = document.createElement("a-entity");
          this.player2.setAttribute("player2", "");
          el.appendChild(this.player2);
        }
      } else {
        if (this.player2) {
          this.player2.remove();
          this.player2 = null;
        }
      }
    };

    // hide scene
    this.hideScene = () => {
      el.style.display = "none";
    };

    this.socket.on("update-game", this.updateGame);
    this.socket.on("full-room", this.hideScene);
  },
});
