class Entity extends createjs.Shape {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super();
    this.id       = id;
    this.position = $V([0,0]);
    this.radius   = 10;
    this.isEntity = true;

    this.graphics.f("#555").s("#EEE").dc(0,0,this.radius);
    this.on("tick", this.update, this);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {

  }

}
