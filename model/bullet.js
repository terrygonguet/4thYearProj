const sylvester = require('sylvester');
const SAT = require('sat');
const tools = require('../tools');

class Bullet {

  /**
   * @param {Vector} position : the position (in the center of the block)
   * @param {Vector} direction : the direction of the bullet, will be normalized
   * @param {Number} speed : speed in unit/s
   * @param {String} playerid : ID of the player that fired the bullet
   * @param {String} sound : ID of the sound to play
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      position: { x:0, y:0 },
      direction: { x:1, y:0 },
      speed: 0,
      sound: "Pew",
    }, params);
    this.playerid  = settings.playerid;
    this.position  = settings.position;
    this.direction = settings.direction.toUnitVector(); // to be sure
    this.speed     = settings.speed;
    this.sound     = settings.sound;
    this.isBullet  = true;
    this.thickness = 3;
    this.toDie     = false;

    this.hitbox    = new SAT.Polygon(tools.toSAT(this.position));
  }

  /**
   * @param {eventdata} e
   */
  update (delta) {
    const movement = this.direction.x(this.speed * delta);
    const oldpos = this.position.dup();
    this.hitbox.pos = tools.toSAT(this.position);
    this.position = this.position.add(movement);

    this.hitbox.setPoints([ tools.toSAT($V([0,0])), tools.toSAT(movement) ]);
  }

  /**
   * Calculate movements and then calls gameobj.collide for every collidable
   * @param {Object} inputobj refer to update
   * @param {Game} gameobj the Game object on which collide will be called and given the player and the collidables
   * @param {Array} collidables an array of collidables
   */
  updateAndCollide(inputobj, gameobj, collidables) {
    this.update(inputobj);
    gameobj.collide(this, collidables);
    if (
      Math.abs(this.position.e(1)) > gameobj.dimensions[0]/2 ||
      Math.abs(this.position.e(2)) > gameobj.dimensions[1]/2
    )
      this.toDie = true;
  }

}
module.exports = Bullet;
