class Entity extends createjs.Shape {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super();
    this.id       = id;
    this.position = $V([Math.random() * window.innerWidth, Math.random() * window.innerHeight]);
    this.radius   = 10;
    this.isEntity = true;

    this.graphics.c().f("#555").s("#EEE").dc(0,0,this.radius);
    this.on("tick", this.update, this);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    const pos = this.position.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({
      x: pos.e(1), y: pos.e(2)
    });
  }

}
