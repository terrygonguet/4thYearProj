class Block extends createjs.Shape {

  /**
   * @param {String} id : the id of the object
   * @param {Vector} position : the position (in the center of the block)
   * @param {Vector} dimensions : Width and height of the Block
   * @param {Number} angle : rotation of the block in radians
   */
  constructor(id, position, dimensions, angle) {
    super();

    this.id           = id;
    this.position     = position;
    this.dimensions   = dimensions;
    this.angle        = angle;
    this.isCollidable = true;
    this.hitbox       = null;
    this.radius       = dimensions.max();
    this.shadow       = new Neon();
    this.isForeground = true;
    this.lines        = null;

    // setup hitbox
    const points = [
      dimensions.x(0.5).toSAT(),
      $V([ dimensions.e(1) * -0.5, dimensions.e(2) * 0.5 ]).toSAT(),
      dimensions.x(-0.5).toSAT(),
      $V([ dimensions.e(1) * 0.5, dimensions.e(2) * -0.5 ]).toSAT()
    ];
    this.hitbox = new SAT.Polygon(this.position.toSAT(), points);

    // setup graphics
    this.graphics.s("#EEE").f("#111").r(dimensions.e(1) * -0.5, dimensions.e(2) * -0.5, dimensions.e(1), dimensions.e(2));
    this.hitbox.setAngle(angle);
    this.rotation = 57.2958 * angle;
    this.set({ x: this.position.e(1), y: this.position.e(2) });

    this.on("tick", e => !e.paused && this.update(e));
  }

  getContact (line) {
    // TODO : make hitting things prettier
  }

  /**
   * Moves the box
   * @param {Vector} position : position to move to
   */
  moveTo (position) {
    this.position = position;
    this.hitbox.pos = position.toSAT();
    this.set({ x: this.position.e(1), y: this.position.e(2) });
  }

  /**
   * Rotates the box
   * @param {Number} angle : angle in radians
   */
  setAngle (angle) {
    this.angle = angle;
    this.rotation = 57.2958 * angle;
    this.hitbox.setAngle(angle);
  }

}
