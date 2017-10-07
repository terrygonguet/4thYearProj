class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super(id);
    Math.seedrandom(this.id);
    this.speed    = 300;
    this.position = $V([0,0]);
    this.hasMoved = false;
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
      this.hasMoved = true; // to reduce necessary updates
      const oldpos = this.position.dup();
      const movement = input.direction.x(this.speed * e.sdelta);
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

      const realpos = this.position.add(game.background.position);
      if (realpos.modulus() > 0.3 * window.innerHeight) {
        const realmovement = this.position.subtract(oldpos);
        game.background.position = realpos.subtract(this.position).subtract(realmovement);
      } else {
        this.realpos = realpos;
      }
    } else {
      this.hasMoved = false; // to reduce necessary updates
    }

    const pos = this.realpos.add(game.screencenter);

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
    const realmousePos = input.mousePos.subtract(game.background.position).subtract(game.screencenter);
    const direction = realmousePos.subtract(this.position).toUnitVector();
    this.weapon.fire(this, direction);
  }

  die () {
    game.removeChild(this.txtPoints);
    game.removeChild(this.reloadBar);
    super.die();
  }

}
