class Entity extends createjs.Shape {

  constructor(id) {
    super();
    this.id       = id;
    this.position = $V([0,0]);
    this.radius   = 10;
    this.isEntity = true;

    this.graphics.f("#555").s("#EEE").dc(0,0,this.radius);
    this.on("tick", this.update, this);
  }

  update (e) {

  }

}
