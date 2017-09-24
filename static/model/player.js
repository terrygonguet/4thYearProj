class Player extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   */
  constructor(id) {
    super(id);
    this.speed    = 300;
    this.position = $V([0,0]);
    this.hasMoved = false;

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
    this.hasMoved = !this.position.eql(oldpos);
    pos = pos.add($V([window.innerWidth/2, window.innerHeight/2]));
    this.x = pos.e(1);
    this.y = pos.e(2);
  }

}
