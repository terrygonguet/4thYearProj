const tools = require("../tools");
const SAT = require('sat');

class Pickup {

  /**
   * @param {Object} params
   * @param {Vector} params.position
   * @param {String} params.name the name of the weapon class
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      position: { x:0, y:0 },
      name: "MachineGun",
    }, params);
    this.id       = tools.randInt(0,100000);
    this.name     = settings.name;
    this.position = settings.position;
    this.radius   = 6;
    this.hitbox   = new SAT.Circle(tools.toSAT(settings.position), this.radius);
    this.isPickup = true;
    this.toDie    = false;
    this.gameobj  = null;
  }

  /**
   * @return {Object} the JSON representation of this
   */
  serialize() {
    return {
      type:"WeaponPickup",
      params: {
        id:this.id,
        position: { x:this.position.e(1), y:this.position.e(2) },
      }
    };
  }

  /**
   * Calculate movements and then calls gameobj.collide for every collidable
   * @param {Object} inputobj refer to update
   * @param {Game} gameobj the Game object on which collide will be called and given the player and the collidables
   * @param {Array} collidables an array of collidables
   */
  updateAndCollide(inputobj, gameobj, collidables) {
    this.gameobj = gameobj;
    gameobj.collide(this, collidables);
  }

  /**
   * Executes on pickup
   * @param {Object} other
   */
  onCollide(other) {
    if (!other.isPlayer) return ;
    const weapon = require('./weapons/' + this.name.toLowerCase());
    (new weapon()).equip(other);
    other.emit("equipweapon", this.name);
    this.toDie = true;
    this.gameobj.io.to(this.gameobj.id).emit("destroyobject", { id: this.id });
  }

  /**
   * @param {Game} room the room this has been added to
   */
  onAdded(room) {
    room.io.to(room.id).emit("createobject", this.serialize());
  }

}
module.exports = Pickup;
