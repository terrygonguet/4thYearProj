class Bullet extends createjs.Shape {

  /**
   * @param {Vector} position : the position (in the center of the block)
   * @param {Vector} direction : the direction of the bullet, will be normalized
   * @param {Number} speed : speed in unit/s
   * @param {String} playerid : ID of the player that fired the bullet
   * @param {String} sound : ID of the sound to play
   */
  constructor(position, direction, speed, playerid, sound) {
    super();
    this.playerid  = playerid;
    this.position  = position;
    this.direction = direction.toUnitVector(); // to be sure
    this.speed     = speed;
    this.isBullet  = true;
    this.color     = "#EE4";
    this.thickness = 3;
    this.toDie     = false;
    this.shadow    = new Neon("#E11", 15);

    this.hitbox    = new SAT.Polygon(this.position.toSAT());

    var pos = this.position.subtract(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.on("tick", e => !e.paused && this.update(e), this);
    if (sound) {
      const volume = (2000 - game.player.position.distanceFrom(position).clamp(0,2000)) / 2000;
      createjs.Sound.play(sound, { volume });
    }
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
    for (var collidable of game.collidables.concat(Object.values(game.entities).filter(e => e.isPlayer))) {
      const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testPolygonCircle : SAT.testPolygonPolygon);
      if (this.playerid !== collidable.id &&
          test(this.hitbox, collidable.hitbox))
      {
        this.toDie = true;
        // if (collidable.isOnlinePlayer &&
        //   game.player.id === this.playerid)
        // {
        //   const evt = new createjs.Event("playerhit");
        //   evt.data = {
        //     target: collidable.id,
        //     shooter: this.playerid
        //   };
        //   game.dispatchEvent(evt);
        //   createjs.Sound.play("Ping");
        // }
        break;
      }
    }

    // display
    this.graphics.c().s(this.color).ss(this.thickness).mt(0,0).lt(-movement.e(1), -movement.e(2));
    const pos = this.position.subtract(game.background.position).add(game.screencenter);
    this.set({ x: pos.e(1), y: pos.e(2) });
    // destruction
    if (Math.abs(this.position.e(1)) > game.dimensions.e(1)/2 || Math.abs(this.position.e(2)) > game.dimensions.e(2)/2)
      this.toDie = true;
  }

  /**
   * Removes the object & cleans up
   */
  die () {
    game.removeChild(this);
  }

}
Hikari.Bullet = Bullet;
