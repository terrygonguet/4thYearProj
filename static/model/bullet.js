class Bullet extends Entity {

  constructor(position, direction, speed, id=0) {
    super(id === 0 ? game.socket.id + Date.now() : id);
    this.position  = position;
    this.realpos   = position.dup();
    this.direction = direction.toUnitVector(); // to be sure
    this.speed     = speed;
    this.radius    = 4;
    this.isBullet  = true;

    // TODO : hitbox maybe useless for bullet
    this.hitbox.pos = this.position.toSAT();
    this.hitbox.r   = this.radius;

    var pos = this.position.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.graphics.c().f("#EEE").dc(0,0,this.radius);
  }

  update (e) {
    const oldpos = this.position.dup();
    this.position = this.position.add(this.direction.x(this.speed * e.sdelta));
    const movement = this.position.subtract(oldpos);
    const points = [
      this.direction.rotate(Math.PI/2, Vector.Zero(2).x(this.radius)).toSAT(),
      this.direction.rotate(-Math.PI/2, Vector.Zero(2).x(this.radius)).toSAT(),
      movement.add(this.direction.rotate(-Math.PI/2, Vector.Zero(2).x(this.radius))).toSAT(),
      movement.add(this.direction.rotate(Math.PI/2, Vector.Zero(2).x(this.radius))).toSAT(),
    ];
    const rect = new SAT.Polygon(oldpos.toSAT(), points);
    for (var entid in game.entities) {
      if (game.entities.hasOwnProperty(entid) &&
          !game.entities[entid].isBullet &&
          SAT.testPolygonCircle(rect, game.entities[entid].hitbox))
      {
        console.log("Hit " + entid);
        this.die();
      }
    }

    // display
    const pos = this.position.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({ x: pos.e(1), y: pos.e(2) });
    // destruction
    if (Math.abs(this.x) > window.innerWidth || Math.abs(this.y) > window.innerHeight)
      this.die();
  }

}
