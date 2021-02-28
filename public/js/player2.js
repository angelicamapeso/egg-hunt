AFRAME.registerComponent("player2", {
  init: function () {
    this.socket = socket;

    this.el.setAttribute("geometry", {
      primitive: "box",
      height: 1,
      width: 1,
      depth: 1,
    });

    this.el.setAttribute("material", { color: "#FFC65D" });

    this.updatePosition = (game) => {
      const gameObj = JSON.parse(game);
      const player2Pos = gameObj.players.find(
        (player) => player.id !== socket.id
      );
      this.el.object3D.position.set(
        player2Pos.position[0],
        player2Pos.position[1],
        player2Pos.position[2]
      );
    };

    socket.on("update-game", this.updatePosition);
  },

  remove: function () {
    socket.removeEventListener("update-game", this.updatePosition);
  },
});
