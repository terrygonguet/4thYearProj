class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super(id);
    Math.seedrandom(this.id);
    this.speed    = 300;
    this.curspeed = 0;
    this.acc      = 2000;
    this.dec      = 2300;
    this.lastdir  = $V([0,0]);
    this.position = $V([0,0]);
    this.hasMoved = true;
    this.color    = Math.randomRGB();
    this.txtPoints= new QuickText({ text: 0, textAlign: "center", textBaseline: "middle", color: "#111" });
    this.weapon   = new MachineGun();
    this.reloadBar= new createjs.Shape();
    this.isplayer = true;

    this.hitbox.r = this.radius;

    this.graphics.c().f(this.color).s("#EEE").dc(0,0,this.radius);
    this.on("added", e => {
      game.addChild(this.txtPoints);
      game.addChild(this.reloadBar);
    }); // placeholder

    input.on("reload", e => this.weapon.reload());

    this.weapon.on("reloadstart", e => this.reloadBar.visible = true);
    this.weapon.on("reloadend", e => this.reloadBar.visible = false);
    this.weapon.on("reloadtick", e => this.reloadBar.graphics.c().s("#EEE").ss(3).a(
      0,0, this.radius + 4, -Math.PI/2, 2 * Math.PI * this.weapon.reloadBar - Math.PI/2, false
    ));
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (input.direction.modulus() !== 0) {
      this.curspeed = (this.curspeed + this.acc * e.sdelta).clamp(0,this.speed);
      this.lastdir = input.direction.dup();
    } else
      this.curspeed = (this.curspeed - this.dec * e.sdelta).clamp(0,this.speed);

    const oldpos = this.position.dup();
    const movement = this.lastdir.x(this.curspeed * e.sdelta);
    this.position = $V(this.position.add(movement).elements.map(a => a.clamp(-game.dimension/2,game.dimension/2)));

    this.hitbox.pos = this.position.toSAT();
    for (var collidable of game.collidables) {
      if (this === collidable || this.position.distanceFrom(collidable.position) > collidable.radius + this.radius) continue;
      const res = new SAT.Response();
      const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testCircleCircle : SAT.testCirclePolygon);
      if (test(this.hitbox, collidable.hitbox, res)) {
        this.position = this.position.subtract($V([res.overlapV.x, res.overlapV.y]));
        this.hitbox.pos = this.position.toSAT();
      }
    }

    const pos = this.position.subtract(game.background.position).add(game.screencenter);

    this.set({ x: pos.e(1), y: pos.e(2) });
    this.txtPoints.set({ x: pos.e(1), y: pos.e(2) });
    this.reloadBar.set({ x: pos.e(1), y: pos.e(2) });

    this.weapon.update(e);
    input.keys.mouse1 && this.fire();
  }

  /**
   * Fires a Bullet
   */
  fire () {
    const realmousePos = input.mousePos.add(game.background.position).subtract(game.screencenter);
    const direction = realmousePos.subtract(this.position).toUnitVector();
    this.weapon.fire(this, direction);
  }

  die () {
    game.removeChild(this.txtPoints);
    game.removeChild(this.reloadBar);
    super.die();
  }

}
