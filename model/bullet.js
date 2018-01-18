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
  constructor(position, direction, speed, playerid, sound) {
    this.playerid  = playerid;
    this.position  = $V(position);
    this.direction = $V(direction).toUnitVector(); // to be sure
    this.speed     = speed;
    this.isBullet  = true;
    this.thickness = 3;
    this.toDie     = false;

    this.hitbox    = new SAT.Polygon(tools.toSAT(this.position));
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    
  }

  /**
   * Removes the object & cleans up
   */
  die () {
    game.removeChild(this);
  }

}
module.exports = Bullet;
