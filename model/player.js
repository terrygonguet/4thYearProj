const sylvester = require('sylvester');
const SAT = require("sat");
const merge = require('merge');
const tools = require('../tools');

class Player {

  /**
   * @param {Socket} socket the socket object to wrap around
   */
  constructor(socket) {
    socket.join("players");

    this.socket   = socket;
    this.position = $V([0,0]);
    this.lastdir  = $V([0,0]);
    this.score    = 100;
    this.speed    = 300;
    this.acc      = 2000;
    this.dec      = 2300;
    this.curspeed = 0;
    this.inputs   = [];
    this.radius   = 10;
    this.hitbox   = new SAT.Circle(new SAT.V(), this.radius);
    this.lobby    = null;
    this.game     = null;
    this.isPlayer = true;
    this.force    = false;

    merge(this, socket);

    socket.on("disconnect", () => {
      this.game && this.game.removePlayer(socket);
      this.lobby.leave(this);
    });

    socket.on("firebullet", data => {
      this.game && this.game.fireBullet(data);
    });

    socket.on("update", (data, ack) => {
      this.inputs = this.inputs.concat(data.player.inputs);
      ack();
    });

  }

  /**
   * Sets player and hitbox position
   * @param {Vector} vector position as sylvester vector
   */
  setPos(vector) {
    this.position = vector.dup();
    this.hitbox.pos = tools.toSAT(this.position);
  }

  /**
   * Calculates the movement for one input frame
   * @param {Object} inputobj the object detailing the input to process
   */
  update(inputobj) {
    if (inputobj.speed !== undefined || inputobj.direction !== undefined) return ;
    inputobj.sdelta = inputobj.delta / 1000;
    var direction = $V([
      Number(inputobj.right - inputobj.left),
      Number(inputobj.down - inputobj.up)
    ]).toUnitVector();
    // var deltaAcc = -this.dec;
    // if (direction.modulus() !== 0) {
    //   this.lastdir = direction;
    //   deltaAcc = this.acc;
    // }
    // this.curspeed = tools.clamp(this.curspeed + deltaAcc * inputobj.sdelta, 0, this.speed);
    this.setPos(this.position.add(direction.x(this.speed * inputobj.sdelta)));
    // console.log(this.position.subtract($V(inputobj.position)).modulus());
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
    this.setPos(tools.clampVect(this.position, gameobj.dimensions));
  }

  /**
   * Remove the input objects
   */
  clearInput() {
    this.inputs = [];//this.inputs.filter(i => i.id !== id || id);
  }

  /**
   * Get the last ID of an input batch
   * @return {Number}
   */
  getID() {
    if (this.inputs[0]) return this.inputs[0].id;
    else return null;
  }

  /**
   * Returns the JSON representation of the object
   * @return {Object} the serialized player object
   */
  serialize() {
    const data = {
      position: this.position.elements.slice(),
      currentID: this.currentID,
      speed: this.speed,
      score: this.score,
      force: this.force,
      id: this.id
    };
    return data;
  }

}
module.exports = Player;
