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

    this.graphics.c().f("#E55").s("#EEE").dc(0,0,this.radius);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    var oldpos = this.position.dup();
    var pos = this.position.add(input.direction.x(this.speed * e.sdelta));
    pos.setElements([
      pos.e(1).clamp(-window.innerWidth/2, window.innerWidth/2),
      pos.e(2).clamp(-window.innerHeight/2, window.innerHeight/2)
    ]);
    this.position = pos.dup();
    this.hasMoved = !this.position.eql(oldpos); // to reduce necessary updates
    pos = pos.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.x = pos.e(1);
    this.y = pos.e(2);

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
    var direction = input.mousePos.subtract(this.position.add($V([window.innerWidth/2, window.innerHeight/2])));
    var bullet = new Bullet(this.position.dup(), direction, 1200);
    game.addChild(bullet);
    
    var e = new createjs.Event("firebullet");
    e.data = {
      id: bullet.id,
      position: bullet.position.elements,
      direction: bullet.direction.elements,
      speed: bullet.speed
    };
    game.dispatchEvent(e);
  }

}
