const sylvester = require('sylvester');
const SAT = require("sat");
const _ = require('lodash');
const tools = require('../tools');
const Blaster = require('./weapons/blaster');

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
    this.weapon   = null;
    this.lobby    = null;
    this.game     = null;
    this.name     = "";
    this.isPlayer = true;
    this.force    = false;

    _.merge(this, socket);
    (new Blaster()).equip(this);

    socket.on("disconnect", () => {
      this.game && this.game.removePlayer(socket);
      this.lobby.leave(this);
    });

    socket.on("update", (data, ack) => {
      this.inputs = this.inputs.concat(data.player.inputs);
      ack();
    });

    socket.on("setname", name => this.name = name.slice(0,100));

    socket.on("joinroom", id => this.lobby && this.lobby.joinRoom(id, this));

    socket.on("leaveroom", () => this.game && this.game.removePlayer(this));

    socket.on("createroom", data => this.lobby && this.lobby.createRoom(data.type, data.params));
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
    inputobj.mousepos = $V(inputobj.mousepos);
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
    this.weapon.update(inputobj);
    inputobj.mouse1 && this.weapon.fire(inputobj.mousepos.subtract(this.position));
    inputobj.reload && this.weapon.reload();
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
      position: { x:this.position.e(1), y:this.position.e(2)},
      currentID: this.currentID,
      speed: this.speed,
      score: this.score,
      force: this.force,
      name: this.name,
      id: this.id
    };
    return data;
  }

}
module.exports = Player;
