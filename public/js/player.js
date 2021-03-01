AFRAME.registerComponent("player", {
  init: function () {
    // Establish connection
    this.socket = socket;

    // Update position
    this.getPosition = () => {
      let position = new THREE.Vector3();
      return this.el.object3D.getWorldPosition(position);
    };

    // Send position
    this.sendPosition = () => {
      const currentPosition = this.getPosition();
      if (this.position && !this.position.equals(currentPosition)) {
        this.position = currentPosition;
        this.socket.emit(UPDATE_POSITION, [
          this.position.x,
          this.position.y,
          this.position.z,
        ]);
      }
    };

    // Update position when first join
    this.position = this.getPosition();
    console.log(this.position);
    this.socket.emit(JOIN, [this.position.x, this.position.y, this.position.z]);
  },

  tick: function () {
    this.sendPosition();
  },
});
