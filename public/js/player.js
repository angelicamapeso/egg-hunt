AFRAME.registerComponent("player", {
  init: function () {
    // Establish connection
    this.socket = socket;

    // Update position
    this.updatePosition = () => {
      let position = new THREE.Vector3();
      this.position = this.el.object3D.getWorldPosition(position);
    };

    // Send position
    this.sendPosition = () => {
      this.updatePosition();
      this.socket.emit("update-position", [
        this.position.x,
        this.position.y,
        this.position.z,
      ]);
    };

    // Update position when first join
    this.updatePosition();
    this.socket.emit("join", [
      this.position.x,
      this.position.y,
      this.position.z,
    ]);
  },

  tick: function () {
    this.sendPosition();
  },
});