class Shape {
  /* Shape positoin, material and geometry must be written as in A-Frame */
  constructor(id, { position, rotation, material, geometry, animation }) {
    this.id = id;
    this.position = position;
    this.rotation = rotation || null;
    this.material = material;
    this.geometry = geometry;
    this.animation = animation || null;
  }
}

Shape.colours = ["#4CC3D9", "#EF2D5E", "#FFC65D"];

Shape.availableShapes = ["cube", "sphere", "cylinder"];

Shape.opacitySetting = 0.7;

Shape.getRandColour = function () {
  return Shape.colours[Math.floor(Math.random() * Shape.colours.length)];
};

/* Y val depends on height or desired input */
Shape.getRandomPos = function (y) {
  const maxXZPos = 25;
  const minXZPos = -25;
  const x = randNumBetween(minXZPos, maxXZPos);
  const z = randNumBetween(minXZPos, maxXZPos);
  return [x, y, z];
};

Shape.getRandomRot = function (minRotation, maxRotation) {
  const x = randNumBetween(minRotation, maxRotation);
  const y = randNumBetween(minRotation, maxRotation);
  const z = randNumBetween(minRotation, maxRotation);
  return [x, y, z];
};

Shape.generateCube = function (id) {
  // Geometry
  const size = randNumBetween(3.0, 4.0);
  const geometryString = `primitive: box; width: ${size}; height: ${size}; depth: ${size};`;

  // Position
  const position = Shape.getRandomPos(size / 2);
  const positionString = position.join(" ");

  // Rotation
  const rotation = Shape.getRandomRot(-180, 180);
  const rotationString = rotation.join(" ");

  // Material
  const colour = Shape.getRandColour();
  const materialString = `shader: flat; color: ${colour};`;

  return new Shape(id, {
    geometry: geometryString,
    position: positionString,
    rotation: rotationString,
    material: materialString,
  });
};

Shape.generateSphere = function (id) {
  // Geometry
  const size = randNumBetween(1.0, 3.0);
  const geometryString = `primitive: sphere; radius: ${size};`;

  // Position
  const position = Shape.getRandomPos(size - 0.1 * size);
  const positionString = position.join(" ");

  // Material
  const colour = Shape.getRandColour();
  const materialString = `shader: flat; color: ${colour};`;

  return new Shape(id, {
    geometry: geometryString,
    position: positionString,
    material: materialString,
  });
};

Shape.generateCylinder = function (id) {
  // Geometry
  const height = randNumBetween(2.0, 3.0);
  const radius = randNumBetween(1.5, 2.5);
  const geometryString = `primitive: cylinder; height: ${height}; radius: ${radius};`;

  // Position
  const position = Shape.getRandomPos(height - 0.2 * height);
  const positionString = position.join(" ");

  // Rotation
  const rotation = Shape.getRandomRot(-20, 20);
  const rotationString = rotation.join(" ");

  // Material
  const colour = Shape.getRandColour();
  const materialString = `shader: flat; color: ${colour};`;

  return new Shape(id, {
    geometry: geometryString,
    position: positionString,
    rotation: rotationString,
    material: materialString,
  });
};

Shape.generateRandomShape = function (id) {
  const shape =
    Shape.availableShapes[
      Math.floor(Math.random() * Shape.availableShapes.length)
    ];
  const [CUBE, SPHERE, CYLINDER] = Shape.availableShapes;
  switch (shape) {
    case CUBE:
      return Shape.generateCube(id);
    case SPHERE:
      return Shape.generateSphere(id);
    case CYLINDER:
      return Shape.generateCylinder(id);
    default:
      console.log("Shape not available!");
  }
};

Shape.generateEgg = function (id) {
  // Geometry
  const geometryString = "primitive: dodecahedron; radius: 1;";

  // Position
  const position = Shape.getRandomPos(1.5);
  const positionString = position.join(" ");

  // Material
  const colour = Shape.getRandColour();
  const materialString = `color: ${colour};`;

  const animationHoverString = `property: position; from: ${position[0]} ${
    position[1]
  } ${position[2]}; to: ${position[0]} ${position[1] - 0.2} ${
    position[2]
  }; dur: 900; delay: ${
    Math.random() * 1000
  }; easing: easeInOutQuad; dir: alternate; loop: true;`;

  return new Shape(id, {
    geometry: geometryString,
    position: positionString,
    material: materialString,
    animation: animationHoverString,
  });
};

/* Helper function for generating random numbers */
function randNumBetween(min, max) {
  return min + Math.random() * (max - min);
}

module.exports = Shape;
