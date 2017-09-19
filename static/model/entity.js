class Entity extends createjs.Shape {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super();
    this.id       = id;
    this.position = $V([0,0]);
    this.realpos  = $V([0,0]);
    this.radius   = 10;
    this.speed    = 0;
    this.isEntity = true;

    this.graphics.c().f("#555").s("#EEE").dc(0,0,this.radius);
    this.on("tick", this.update, this);
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

    const pos = this.realpos.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({
      x: pos.e(1), y: pos.e(2)
    });
  }

  moveTo (pos, delta) {
    const dist = this.position.distanceFrom(pos);
    this.speed = dist / (delta / 1000);
    this.realpos = this.position.dup();
    this.position = pos.dup();
  }

}
