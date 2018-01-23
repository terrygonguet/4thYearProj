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
    this.score    = 100;
    this.speed    = 0;
    this.inputs   = [];
    this.radius   = 10;
    this.hitbox   = new SAT.Circle(new SAT.V(), this.radius);
    this.currentID= null;
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
      socket.to(this.game.id).emit("firebullet", data);
    });

    socket.on("update", (data, ack) => {
      // socket.position = $V(data.player.position);
      this.speed = data.player.speed;
      this.inputs = this.inputs.concat(data.player.inputs);
      ack();
    });

  }

  /**
   * Calculates the movement for one input frame
   * @param {Object} inputobj the object detailing the input to process
   */
  update(inputobj) {
    this.position = this.position.add($V(inputobj.direction).x(inputobj.speed * inputobj.delta / 1000));
    this.hitbox.pos = tools.toSAT(this.position);
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
    this.position = tools.clampVect(this.position, gameobj.dimensions);
  }

  /**
   * Remove the input objects matching the id or all if not specified
   * @param {Number} id
   */
  clearInput(id=false) {
    this.inputs = [];//this.inputs.filter(i => i.id !== id || id);
    this.currentID = id;
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
      position: this.position.elements,
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
