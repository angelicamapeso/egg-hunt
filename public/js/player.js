AFRAME.registerComponent("player", {
  init: function () {
    // Establish connection
    this.socket = socket;

    // Bindings
    this.sendPosition = this.sendPosition.bind(this);
    this.getPosition = this.getPosition.bind(this);

    // Update position when first join
    this.position = this.getPosition();
    this.socket.emit(JOIN, this.position.toArray());
  },

  tick: function () {
    this.sendPosition();
  },

  // To emit position if player has moved
  sendPosition: function () {
    const currentPosition = this.getPosition();
    if (this.position && !this.position.equals(currentPosition)) {
      this.position = currentPosition;
      this.socket.emit(UPDATE_POSITION, currentPosition.toArray());
    }
  },

  // Helper functions
  getPosition: function () {
    return this.el.object3D.getWorldPosition();
  },
});
