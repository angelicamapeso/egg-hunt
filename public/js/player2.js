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

    this.el.setAttribute("static-body", "");

    // Binding
    this.updatePosition = this.updatePosition.bind(this);
    this.updateRotation = this.updateRotation.bind(this);

    socket.on(UPDATE_POSITION, this.updatePosition);
    socket.on(UPDATE_ROTATION, this.updateRotation);
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

  updateRotation: function (player) {
    if (player.id !== socket.id) {
      this.el.object3D.quaternion.set(
        player.rotation[0],
        player.rotation[1],
        player.rotation[2],
        player.rotation[3]
      );
    }
  },
});
