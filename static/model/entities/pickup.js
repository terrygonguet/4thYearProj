class Pickup extends Entity {

  /**
   * @param {String_Number} id : the unique id of the Entity
   * @param {Vector} position : position ...
   * @param {Number} radius : size of the entity
   * @param {HTMLColor} color : color of the entity
   * @param {function} onpickup : the callback executed when an entity picks up
   * takes in the Entity that picked up as parameter
   */
  constructor(params={}) {
    const settings = makeSettings({
      position: { x:0, y:0 },
      radius: 6,
      color: "#816",
    }, (typeof params !== "object" ? { id: params } : params));
    super(params);
    this.isPickup = true;
  }

  /**
   * @param {Event} e
   */
  update (e) {
    super.update(e);
    if (game.player.position.distanceFrom(this.position) <= game.player.radius + this.radius) {
      this.die();
    }
  }

}
Hikari.Pickup = Pickup;
