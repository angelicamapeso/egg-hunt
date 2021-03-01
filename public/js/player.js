AFRAME.registerComponent("player", {
  init: function () {
    // Establish connection
    this.socket = socket;

    // Bindings
    this.sendPosition = this.sendPosition.bind(this);
    this.getPosition = this.getPosition.bind(this);

    this.sendRotation = this.sendRotation.bind(this);
    this.getRotation = this.getRotation.bind(this);

    // Update position when first join
    this.position = this.getPosition();
    this.rotation = this.getRotation();
    this.socket.emit(JOIN, this.position.toArray(), this.rotation.toArray());
  },

  tick: function () {
    this.sendPosition();
    this.sendRotation();
  },

  // To emit position if player has moved
  sendPosition: function () {
    const currentPosition = this.getPosition();
    if (this.position && !this.position.equals(currentPosition)) {
      this.position = currentPosition;
      this.socket.emit(UPDATE_POSITION, currentPosition.toArray());
    }
  },

  sendRotation: function () {
    const currentRotation = this.getRotation();
    if (this.rotation && !this.rotation.equals(currentRotation)) {
      this.rotation = currentRotation;
      this.socket.emit(UPDATE_ROTATION, currentRotation.toArray());
    }
  },

  // Helper functions
  getPosition: function () {
    let position = new THREE.Vector3();
    return this.el.object3D.getWorldPosition(position);
  },

  getRotation: function () {
    let rotation = new THREE.Quaternion();
    return this.el.object3D.getWorldQuaternion(rotation);
  },
});
