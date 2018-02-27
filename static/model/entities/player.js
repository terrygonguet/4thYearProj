class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   * @param {Vector} position : starting position
   */
  constructor(params) {
    const settings = makeSettings({
      position: { x:0, y:0 },
      radius: 10,
      color: "rgb(0,255,0)",
    }, (typeof params !== "object" ? { id: params } : params));
    super(settings);
    this.speed        = 300;
    this.curspeed     = 0;
    this.acc          = 2000;
    this.dec          = 2300;
    this.lastdir      = this.position.dup();
    this.serverState  = null;
    this.hasMoved     = true;
    this.weapon       = null;
    this.reloadBar    = new createjs.Shape();
    this.isPlayer     = true;
    this.inputHistory = [];

    this.on("added", e => {
      game.addChild(this.reloadBar);
    }); // placeholder
    this.reloadBar.shadow = new Neon("#E1E");
    this.setWeapon(new Blaster());

    input.on("reload", e => this.weapon.reload());
  }

  setWeapon (weapon) {
    this.weapon = weapon;
    this.weapon.rng = new Math.seedrandom(this.id);
    this.weapon.on("reloadstart", e => this.reloadBar.visible = true);
    this.weapon.on("reloadend", e => this.reloadBar.visible = false);
    this.weapon.on("reloadtick", e => this.reloadBar.graphics.c().s("#1EE").ss(3).a(
      0,0, this.radius + 4, -Math.PI/2, 2 * Math.PI * this.weapon.reloadBar - Math.PI/2, false
    ));
  }

  consolidateInput() {
    const ih = this.inputHistory; // shorthand
    const toOmit = ['position', 'delta', 'debug', 'pause']; // shorthand
    if (!ih.length) return false;
    if (ih.length >= 2) {
      var i = 0;
      while (ih.length > 1 && i < ih.length-1) {
        var isConsolidable = _.isEqual(ih[i].position, ih[i+1].position);
        isConsolidable && _.forIn(_.omit(ih[i], toOmit), (v,k) => isConsolidable = isConsolidable && !v);
        isConsolidable && _.forIn(_.omit(ih[i+1], toOmit), (v,k) => isConsolidable = isConsolidable && !v);
        if (isConsolidable) {
          this.inputHistory[i+1].delta += this.inputHistory[i].delta;
          this.inputHistory.shift();
        } else i++;
      }
    }
    return (ih.length > 1 || !_.values(_.omit(ih[0], toOmit)).every(k => !k));
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
        this.setPos(this.serverState.position);
        this.inputHistory = [];
      }
      this.serverState = null;
    }

    // var deltaAcc = -this.dec;
    // if (input.direction.modulus() !== 0) {
    //   this.lastdir = input.direction;
    //   deltaAcc = this.acc;
    // }
    // this.curspeed = (this.curspeed + deltaAcc * e.sdelta).clamp(0,this.speed);

    const oldpos = this.position.dup();
    // const movement = this.lastdir.x(this.speed * e.sdelta);
    const movement = input.direction.x(this.speed * e.sdelta);
    this.setPos(this.position.add(movement));

    for (var collidable of game.collidables) {
      if (this === collidable || this.position.distanceFrom(collidable.position) > collidable.radius + this.radius) continue;
      const res = new SAT.Response();
      const test = (collidable.hitbox instanceof SAT.Circle ? SAT.testCircleCircle : SAT.testCirclePolygon);
      if (test(this.hitbox, collidable.hitbox, res)) {
        this.setPos(this.position.subtract($V([res.overlapV.x, res.overlapV.y])));
      }
    }

    this.setPos(this.position.clamp(game.dimensions.elements));
    this.hasMoved = !oldpos.eql(this.position);

    this.inputHistory.push(_.assign(_.clone(input.keys), {
      delta:e.delta,
      position:this.position.elements.slice(),
      mousepos:game.camera.globalToLocal(input.mousePos)
    }));

    this.reloadBar.position = this.position;

    this.weapon.update(e);
    input.keys.mouse1 && this.fire();
  }

  /**
   * Sets the score displayed on the player
   * @param {Number} score : the score to set to
   */
  setScore(score) {
    this.graphics.c().f(`rgb(${255-score*2.55},${score*2.55},0)`).s("#EEE").dc(0,0,this.radius);
  }

  /**
   * Fires a Bullet
   */
  fire () {
    const realmousePos = game.camera.globalToLocal(input.mousePos);
    const direction = realmousePos.subtract(this.position).toUnitVector();
    this.weapon.fire(this, direction);
  }

  die () {
    game.removeChild(this.reloadBar);
    super.die();
  }

}
Hikari.Player = Player;
