class Entity extends createjs.Shape {

  /**
   * @param {String_Number} id : the unique id of the Entity
   * @param {Vector} position : position ...
   * @param {Number} radius : size of the entity
   * @param {HTMLColor} color : color of the entity
   */
  constructor(params={}) {
    const settings = makeSettings({
      position: { x:0, y:0 },
      radius: 10,
      color: "#EEE",
    }, (typeof params !== "object" ? { id: params } : params));
    super();
    this.id           = settings.id;
    this.position     = settings.position;
    this.realpos      = settings.position.dup();
    this.radius       = settings.radius;
    this.color        = settings.color;
    this.speed        = 0;
    this.isEntity     = true;
    this.hitbox       = new SAT.Circle(new SAT.V(), this.radius);

    this.graphics.c().f(this.color).s("#EEE").dc(0,0,this.radius);
    this.on("tick", e => !e.paused && this.update(e), this);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (this.realpos.distanceFrom(this.position) >= this.speed * e.sdelta) {
      const direction = this.position.subtract(this.realpos).toUnitVector();
      this.realpos = this.realpos.add(direction.x(this.speed * e.sdelta));
    } else
      this.realpos = this.position;

    const pos = this.position.subtract(game.background.position).add(game.screencenter);

    this.set({
      x: pos.e(1), y: pos.e(2)
    });
    this.hitbox.pos = this.realpos.toSAT();
  }

  /**
   * Move from current position to new position at specified speed
   * @param {Vector} pos : new position to move to
   * @param {Number} speed : base speed to move at
   * Note : to keep up with network, if the entity is starting to lag behind the speed will be increased
   */
  moveTo (pos, speed) {
    const dist = pos.distanceFrom(this.position);
    if (dist > 0) {
      const realdist = pos.distanceFrom(this.realpos);
      // this.speed = speed * (realdist / dist);
      this.speed = speed;
      this.realpos = this.position.dup();
      this.setPos(pos);
    }
    // this.realpos = pos.dup();
    // this.position = pos.dup();
  }

  /**
   * Sets entity position
   * @param {Vector} pos the position to go to
   */
  setPos(pos) {
    this.position = pos.dup();
    this.hitbox.pos = pos.toSAT();
  }

  /**
   * Kills and cleans up the entity
   * @param {Bool} playerKill : true if the entity was killed by a player
   */
  die (playerKill = false) {
    game.removeChild(this);
  }

}
Hikari.Entity = Entity;
