class Block extends createjs.Shape {

  /**
   * @param {String} id : the id of the object
   * @param {Vector} position : the position (in the center of the block)
   * @param {Vector} dimensions : Width and height of the Block
   * @param {Number} angle : rotation of the block in radians
   */
  constructor(params={}) {
    const settings = makeSettings({
      position: { x:0, y:0 },
      dimensions: { x:0, y:0 },
      angle: 0
    }, params);
    super();

    this.id             = settings.id;
    this.position       = settings.position;
    this.dimensions     = settings.dimensions;
    this.angle          = settings.angle;
    this.isBlock        = true;
    this.isCollidable   = true;
    this.isSolid        = true;
    this.isInForeground = true;
    this.hitbox         = null;
    this.radius         = settings.dimensions.max();
    this.shadow         = new Neon();
    this.lines          = null;

    // setup hitbox
    const points = [
      this.dimensions.x(0.5).toSAT(),
      $V([ this.dimensions.e(1) * -0.5, this.dimensions.e(2) * 0.5 ]).toSAT(),
      this.dimensions.x(-0.5).toSAT(),
      $V([ this.dimensions.e(1) * 0.5, this.dimensions.e(2) * -0.5 ]).toSAT()
    ];
    this.hitbox = new SAT.Polygon(this.position.toSAT(), points);

    // setup graphics
    this.graphics.s("#EEE").f("#111").r(this.dimensions.e(1) * -0.5, this.dimensions.e(2) * -0.5, this.dimensions.e(1), this.dimensions.e(2));
    this.hitbox.setAngle(settings.angle);
    this.rotation = 57.2958 * settings.angle;
    this.set({ x: this.position.e(1), y: this.position.e(2) });

    this.on("tick", e => !e.paused && this.update(e));
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
Hikari.Block = Block;
