class Player extends Entity {

  constructor(id) {
    super(id);
    this.speed = 300;
    this.position = $V([window.innerWidth/2, window.innerHeight/2]);

    this.graphics.c().f("#E55").s("#EEE").dc(0,0,this.radius);
  }

  update (e) {
    this.position = this.position.add(input.direction.x(this.speed * e.sdelta));
    this.x = this.position.e(1); this.y = this.position.e(2);
  }

}
