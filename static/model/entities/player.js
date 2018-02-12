class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   * @param {Vector} position : starting position
   */
  constructor(id, position=$V([0,0])) {
    Math.seedrandom(id);
    super(id, position, 10, Math.randomRGB());
    this.speed        = 300;
    this.curspeed     = 0;
    this.acc          = 2000;
    this.dec          = 2300;
    this.lastdir      = this.position.dup();
    this.serverState  = null;
    this.hasMoved     = true;
    this.txtPoints    = new QuickText({ text: 0, textAlign: "center", textBaseline: "middle", color: "#EEE" });
    this.weapon       = new Blaster();
    this.reloadBar    = new createjs.Shape();
    this.isPlayer     = true;
    this.inputHistory = [];

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
    if (this.serverState) {
      this.setScore(this.serverState.score);
      if (this.serverState.force)
      {
        console.log("forced position to " + this.serverState.position + " from " + this.position.inspect());
        this.position = $V(this.serverState.position);
      }
      this.serverState = null;
    }

    var deltaAcc = -this.dec;
    if (input.direction.modulus() !== 0) {
      this.lastdir = input.direction;
      deltaAcc = this.acc;
    }
    this.curspeed = (this.curspeed + deltaAcc * e.sdelta).clamp(0,this.speed);

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

    this.position = this.position.clamp(game.dimensions.elements);
    this.hasMoved = !oldpos.eql(this.position);

    this.inputHistory.push(_.merge(input.keys, {
      sdelta:e.sdelta,
      position:this.position.elements.slice()
    }));

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
