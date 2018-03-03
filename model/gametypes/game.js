const tools = require("../../tools");
const SAT = require('sat');
const _ = require('lodash');

class Game {
  /**
   * @param {Object} params
   * @param {IO}     params.io
   * @param {String} params.type : display name
   * @param {Number} params.maxplayers
   * @param {Array}  params.dimensions : X and Y dimensions of the arena
   * @param {Object} params.states : a dicionary of state objects
   * @param {Bool}   params.updateIfEmpty : true to run update if no players in room
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      type:'-',
      maxplayers:8,
      dimensions:[5000,5000],
      states: { default:'-' },
      updateIfEmpty: false,
    }, params);
    this.id                = tools.nextID();
    this.io                = settings.io;
    this.type              = settings.type;
    this.maxplayers        = settings.maxplayers;
    this.timeWithNoPlayers = 0;
    this.players           = [];
    this.objects           = [];
    this.dimensions        = settings.dimensions;
    this.ingame            = false;
    this.state             = _.keys(settings.states)[0];
    this.states            = settings.states;
  }

  /**
   * Updates the game state
   * @param {Number} delta : the number of ms since last update
   */
  update(delta) {
    if (this.players.length) this.timeWithNoPlayers = 0;
    else {
      this.timeWithNoPlayers += delta;
      if (!this.updateIfEmpty) return ;
    }
  }

  /**
   * @return {Object} The JSON representation of the object
   */
  serialize() {
    return {
      id        : this.id,
      type      : this.type,
      state     : this.state,
      players   : this.players.length,
      maxplayers: this.maxplayers,
    };
  }

  /**
   * collides object with the collidables
   * @param {Player} object the object that updated (player, bullet ...)
   * @param {Array} collidables an array of objects with a hitbox property
   */
  collide (object, collidables) {
    for (var collidable of collidables) {
      if (object.id === collidable.id) continue;
      const res = new SAT.Response();
      const test = "test" +
        (object.hitbox instanceof SAT.Circle ? "Circle" : "Polygon") +
        (collidable.hitbox instanceof SAT.Circle ? "Circle" : "Polygon");

      if (SAT[test](object.hitbox, collidable.hitbox, res)) {
        object.onCollide && object.onCollide(collidable);
        if (object.isSolid && collidable.isSolid) {
          object.position = object.position.subtract($V([res.overlapV.x, res.overlapV.y]));
          object.hitbox.pos = tools.toSAT(object.position);
        }
      }
    }
  }

  /**
   * Transmits the game state to the players
   * @param {Number} delta : the number of ms since last update
   */
  netupdate(delta) {
    if (!this.players.length) return ;
  }

  /**
   * Resets map and players
   * @param {Function} placePlayer : a function that returns a new player pos, takes in player object, defaults to random
   * @param {Function} afterReset : a function that runs after the game has been reset and before sending to players
   */
  reset(placePlayer, afterReset) {
    if (!placePlayer) {
      placePlayer = () => $V([
        tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
        tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
      ]);
    }
    this.players.forEach(p => {
      p.setPos(placePlayer(p));
      p.score = 100;
      p.force = true;
      p.inputs = [];
    });
    this.objects = [];
    afterReset && afterReset();
    this.io.to(this.id).emit("createarena", {
      objects: this.objects.map(b => b.serialize()),
      dimensions: this.dimensions,
      players: this.players.map(p => p.serialize())
    });
  }

  /**
   * Make the player join this room and sends him the arena
   * @param {Player} player
   * @param {Function} placePlayer : a function that returns a new player pos, takes in player object, defaults to random
   */
  addPlayer(player, placePlayer) {
    if (!placePlayer) {
      placePlayer = () => $V([
        tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
        tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
      ]);
    }
    this.players.push(player);
    player.game && player.game.removePlayer(player);
    player.join(this.id);
    player.game = this;
    player.setPos(placePlayer(player));

    player.emit("createarena", {
      objects: this.objects.map(b => b.serialize()),
      dimensions: this.dimensions,
      players: this.players.map(p => p.serialize()),
    });
  }

  /**
   * Make player leave and cleans up
   * @param {Player} player
   */
  removePlayer(player) {
    player.leave(this.id);
    this.players = this.players.filter(p => p.id !== player.id);
    player.game = null;
    this.io.to(this.id).emit("playerleave", { id: player.id });
  }

  /**
   * cleans up everything so that the object can be discarded
   */
  destroy() {
    for (var player of this.players) {
      this.removePlayer(player);
    }
  }

  /**
   * Adds an object to the Arena
   * @param {Object} obj
   */
  addChild(obj) {
    this.objects.push(obj);
    obj.onAdded && obj.onAdded(this);
  }

}

module.exports = Game;
