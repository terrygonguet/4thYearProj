class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   * @param {Vector} position : starting position
   */
  constructor(id, position) {
    Math.seedrandom(id);
    if (!position)
      position = $V([
        Math.randFloat(-game.dimensions.e(1)/2, game.dimensions.e(1)/2),
        Math.randFloat(-game.dimensions.e(2)/2, game.dimensions.e(2)/2)
      ]);
    super(id, position, 10, Math.randomRGB());
    this.speed    = 300;
    this.curspeed = 0;
    this.acc      = 2000;
    this.dec      = 2300;
    this.lastdir  = this.position.dup();
    this.hasMoved = true;
    this.txtPoints= new QuickText({ text: 0, textAlign: "center", textBaseline: "middle", color: "#111" });
    this.weapon   = new Blaster();
    this.reloadBar= new createjs.Shape();
    this.isplayer = true;

    this.on("added", e => {
      game.addChild(this.txtPoints);
      game.addChild(this.reloadBar);
    }); // placeholder
    this.reloadBar.shadow = new Neon("#E1E");

    input.on("ratata", e => this.setWeapon(new MachineGun()));
    input.on("reload", e => this.weapon.reload());
  }

  setWeapon (weapon) {
    this.weapon = weapon;
    this.weapon.on("reloadstart", e => this.reloadBar.visible = true);
    this.weapon.on("reloadend", e => this.reloadBar.visible = false);
    this.weapon.on("reloadtick", e => this.reloadBar.graphics.c().s("#1EE").ss(3).a(
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
    this.position = this.position.add(movement);

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

    this.position = $V(this.position.elements.map((e, i) => e.clamp(-game.dimensions.e(i+1)/2, game.dimensions.e(i+1)/2)));
    this.hasMoved = !oldpos.eql(this.position);

    const pos = this.position.subtract(game.background.position).add(game.screencenter);

    this.set({ x: pos.e(1), y: pos.e(2) });
    this.txtPoints.set({ x: pos.e(1), y: pos.e(2) });
    this.reloadBar.set({ x: pos.e(1), y: pos.e(2) });

    this.weapon.update(e);
    input.keys.mouse1 && this.fire();
  }

  /**
   * Sets the score displayed on the player
   * @param {Number} score : the score to set to
   */
  setScore(score) {
    this.txtPoints.text = score;
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
Hikari.Player = Player;
