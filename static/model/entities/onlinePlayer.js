class OnlinePlayer extends Player {

  constructor(params={}) {
    super(params);
    this.isOnlinePlayer = true;
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (this.realpos.distanceFrom(this.position) >= this.speed * e.sdelta) {
      const direction = this.position.subtract(this.realpos).toUnitVector();
      this.realpos = this.realpos.add(direction.x(this.speed * e.sdelta));
    } else
      this.realpos = this.position.dup();

    this.txtPoints.position = this.position ;

    this.hitbox.pos = this.position.toSAT();
  }

}
Hikari.OnlinePlayer = OnlinePlayer
