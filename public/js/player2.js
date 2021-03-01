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

    // Binding
    this.updatePosition = this.updatePosition.bind(this);

    socket.on(UPDATE_POSITION, this.updatePosition);
  },

  remove: function () {
    socket.removeEventListener(UPDATE_POSITION, this.updatePosition);
  },

  updatePosition: function (player) {
    if (player.id !== socket.id) {
      this.el.object3D.position.set(
        player.position[0],
        player.position[1],
        player.position[2]
      );
    }
  },
});
