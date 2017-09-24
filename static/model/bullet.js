class Bullet extends Entity {

  constructor(position, direction, speed, id=0) {
    super(id === 0 ? game.socket.id + Date.now() : id);
    this.position  = position;
    this.realpos   = position.dup();
    this.direction = direction.toUnitVector(); // to be sure
    this.speed     = speed;
    this.radius    = 4;

    var pos = this.position.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({ x: pos.e(1), y: pos.e(2) });

    this.graphics.c().f("#EEE").dc(0,0,this.radius);
  }

  update (e) {
    this.position = this.position.add(this.direction.x(this.speed * e.sdelta));
    var pos = this.position.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.set({ x: pos.e(1), y: pos.e(2) });
    if (Math.abs(this.x) > window.innerWidth || Math.abs(this.y) > window.innerHeight)
      this.die();
  }

}
