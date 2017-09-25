class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super(id);
    this.speed    = 300;
    this.position = $V([0,0]);
    this.hasMoved = false;
    this.fireRate = 3;
    this.time     = 0;
    this.txtPoints= new QuickText({ text: 0, textAlign: "center", textBaseline: "middle", color: "#999" });

    this.hitbox.r = this.radius;

    Math.seedrandom(this.id);
    this.graphics.c().f(Math.randomRGB()).s("#EEE").dc(0,0,this.radius);
    this.on("added", e => game.addChild(this.txtPoints)); // placeholder
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    const oldpos = this.position.dup();
    var pos = this.position.add(input.direction.x(this.speed * e.sdelta));
    pos.setElements([
      pos.e(1).clamp(-window.innerWidth/2, window.innerWidth/2),
      pos.e(2).clamp(-window.innerHeight/2, window.innerHeight/2)
    ]);
    this.position = pos.dup();
    this.hasMoved = !this.position.eql(oldpos); // to reduce necessary updates
    pos = pos.add(game.screencenter.dup());

    this.set({ x: pos.e(1), y: pos.e(2) });
    this.txtPoints.set({ x: pos.e(1), y: pos.e(2) });

    this.hitbox.pos = this.position.toSAT();

    this.time += e.delta;
    if (input.keys.mouse1 && this.time >= 1000 / this.fireRate) {
      this.time = 0;
      this.fire();
    }
  }

  /**
   * Fires a Bullet
   */
  fire () {
    const direction = input.mousePos.subtract(this.position.add(game.screencenter.dup())).toUnitVector();
    const bullet = new Bullet(this.position.add(direction.x(this.radius + 2)), direction, 1200, this.id);
    game.addChild(bullet);

    var e = new createjs.Event("firebullet");
    e.data = {
      position: bullet.position.elements,
      direction: bullet.direction.elements,
      speed: bullet.speed,
      playerid: bullet.playerid
    };
    game.dispatchEvent(e);
  }

  die () {
    game.removeChild(this.txtPoints);
    super.die();
  }

}
