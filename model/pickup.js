const tools = require("../tools");

class Pickup {

  constructor(params={}) {
    const settings = tools.makeSettings({
      position: { x:0, y:0 },
      name: "MachineGun",
    }, params);
    this.id       = require("../tools").randInt(0,100000);
    this.name     = settings.name;
    this.position = settings.position;
    this.radius   = 6;
  }

  serialize() {
    return {
      type:"WeaponPickup",
      params: {
        id:this.id,
        position: { x:this.position.e(1), y:this.position.e(2) },
      }
    };
  }

  pickup(player) {
    const weapon = require('./weapons/' + this.name.toLowerCase());
    (new weapon()).equip(player);
    player.emit("equipweapon", this.name);
  }

}
module.exports = Pickup;
