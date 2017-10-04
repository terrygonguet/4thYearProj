class Bullet extends createjs.Shape {

  constructor(position, direction, speed, playerid) {
    super();
    this.playerid  = playerid;
    this.position  = position;
    this.direction = direction.toUnitVector(); // to be sure
    this.speed     = speed;
    this.isBullet  = true;
    this.color     = "#EE4";
    this.thickness = 3;
    this.toDie     = false;

    this.hitbox    = new SAT.Polygon(this.position.toSAT());

    var pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.on("tick", e => !e.paused && this.update(e), this);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (this.toDie) {
      this.die();
      return;
    }

    const movement = this.direction.x(this.speed * e.sdelta);
    const oldpos = this.position.dup();
    this.hitbox.pos = this.position.toSAT();
    this.position = this.position.add(movement);


    this.hitbox.setPoints([ $V([0,0]).toSAT(), movement.toSAT() ]);
    for (var collidable of game.collidables) {
      const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testPolygonCircle : SAT.testPolygonPolygon);
      if (this.playerid !== collidable.id &&
          test(this.hitbox, collidable.hitbox))
      {
        // this.die();
        this.toDie = true;
        if (game.player.id === this.playerid) {
          const evt = new createjs.Event("playerhit");
          evt.data = {
            target: collidable.id,
            shooter: this.playerid
          };
          game.dispatchEvent(evt);
        }
      }
    }

    // display
    this.graphics.c().s(this.color).ss(this.thickness).mt(0,0).lt(-movement.e(1), -movement.e(2));
    const pos = this.position.add(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
    // destruction
    if (Math.abs(this.position.e(1)) > game.dimension/2 || Math.abs(this.position.e(2)) > game.dimension/2)
      // this.die();
      this.toDie = true;
  }

  /**
   * Removes the object & cleans up
   */
  die () {
    game.removeChild(this);
  }

}
