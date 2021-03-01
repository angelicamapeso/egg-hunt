AFRAME.registerComponent("player", {
  init: function () {
    // Establish connection
    this.socket = socket;

    // Bindings
    this.sendPosition = this.sendPosition.bind(this);
    this.getPosition = this.getPosition.bind(this);

    // Update position when first join
    this.position = this.getPosition();
    this.socket.emit(JOIN, [this.position.x, this.position.y, this.position.z]);
  },

  tick: function () {
    this.sendPosition();
  },

  // To emit position if player has moved
  sendPosition: function () {
    const currentPosition = this.getPosition();
    if (this.position && !this.position.equals(currentPosition)) {
      this.position = currentPosition;
      this.socket.emit(UPDATE_POSITION, [
        this.position.x,
        this.position.y,
        this.position.z,
      ]);
    }
  },

  // Helper functions
  getPosition: function () {
    let position = new THREE.Vector3();
    return this.el.object3D.getWorldPosition(position);
  },
});
