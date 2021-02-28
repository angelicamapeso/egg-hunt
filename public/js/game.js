/* Component manages game state */
AFRAME.registerComponent("game", {
  init: function () {
    const el = this.el;
    this.socket = socket;

    // update game state
    this.game = null;
    this.updateGame = (game) => {
      this.game = JSON.parse(game);
    };

    // hide scene
    this.hideScene = () => {
      el.style.display = "none";
    };

    this.socket.on("update-game", this.updateGame);
    this.socket.on("full-room", this.hideScene);
  },
});
