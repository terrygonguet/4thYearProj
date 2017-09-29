class Bullet extends createjs.Shape {

  constructor(position, direction, speed, playerid) {
    super();
    this.playerid  = playerid;
    this.position  = position;
    this.direction = direction.toUnitVector(); // to be sure
    this.speed     = speed;
    this.radius    = 4;
    this.isBullet  = true;
    this.toDie     = false;

    // TODO : hitbox maybe useless for bullet
    this.hitbox    = new SAT.Circle(this.position.toSAT(), this.radius);

    var pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.graphics.c().f("#EEE").dc(0,0,this.radius);
    this.on("tick", e => !e.paused && this.update(e), this);
  }

  update (e) {
    // So that the bullet doesn't dissapear before visually colliding
    if (this.toDie) {
      this.die();
      return;
    }

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
      console.log(this.playerid);
      if (game.entities.hasOwnProperty(entid) &&
          this.playerid !== entid &&
          SAT.testPolygonCircle(rect, game.entities[entid].hitbox))
      {
        this.toDie = true;
        if (game.player.id === this.playerid) {
          const evt = new createjs.Event("playerhit");
          evt.data = {
            target: entid,
            shooter: this.playerid
          };
          game.dispatchEvent(evt);
        }
      }
    }

    // display
    const pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
    // destruction
    if (Math.abs(this.position.e(1)) > game.dimension/2 || Math.abs(this.position.e(2)) > game.dimension/2)
      this.die();
  }

  /**
   * Removes the object & cleans up
   */
  die () {
    game.removeChild(this);
  }

}
