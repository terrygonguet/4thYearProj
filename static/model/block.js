class Block extends createjs.Shape {

  constructor(id, position, dimensions, angle) {
    super();

    this.id           = id;
    this.position     = position;
    this.dimensions   = dimensions;
    this.angle        = angle;
    this.isCollidable = true;
    this.hitbox       = null;

    const points = [
      dimensions.x(0.5).toSAT(),
      $V([ dimensions.e(1) * -0.5, dimensions.e(2) * 0.5 ]).toSAT(),
      dimensions.x(-0.5).toSAT(),
      $V([ dimensions.e(1) * 0.5, dimensions.e(2) * -0.5 ]).toSAT()
    ];
    this.hitbox = new SAT.Polygon(this.position.toSAT(), points);

    this.graphics.s("#EEE").f("#111").r(dimensions.e(1) * -0.5, dimensions.e(2) * -0.5, dimensions.e(1), dimensions.e(2));
    this.hitbox.setAngle(angle);
    this.rotation = 57.2958 * angle;
    var pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.on("tick", e => !e.paused && this.update(e));
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    var pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
  }

}
