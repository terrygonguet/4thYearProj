const sylvester = require('sylvester');
const SAT = require("sat");
const now = require('present');
const io = require('socket.io');
const Player = require('./player');
const tools = require('../tools');

class Lobby {

  /**
   * @param {IO} io : the IO object to handle sockets
   */
  constructor(params={}) {
    const settings = tools.makeSettings({
      updateRate:60,
      netUpdateRate: 15,
    }, params);
    const self = this;
    this.rooms         = [];
    this.io            = settings.io;
    this.updateRate    = settings.updateRate;
    this.netUpdateRate = settings.netUpdateRate;
    this.gamelist      = {
      "Game": require("./game")
    };

    // Update
    (function tick(old) {
      var delta = (now() - old);
      self.update(delta);
      setTimeout(tick, 1000 / self.updateRate, now());
    })(now());

    // Net Update
    (function tick(old) {
      var delta = (now() - old);
      self.netupdate(delta);
      setTimeout(tick, 1000 / self.netUpdateRate, now());
    })(now());

    this.createRoom("Game");
  }

  /**
   * Creates a room in the lobby
   * @param {String} type : the type of room to create
   * @param {Object} params : the conf object to give to the Game constructor, defaults if null
   * @return {Game} the game created
   */
  createRoom(type, params) {
    const game = new this.gamelist[type](this.io, params);
    this.rooms.push(game);
    return game;
  }

  /**
   * If the socket isn't a player it is made so and joins the lobby
   * @param {socket} socket : the player
   */
  join(socket) {
    var player = socket;
    if (!socket.isPlayer) player = Lobby.makePlayer(socket);
    player.lobby = this;
    this.rooms[0].addPlayer(player);
  }

  /**
   * Leaves the lobby
   * @param {socket} socket : the player
   */
  leave(socket) {
    socket.lobby = null;
    Lobby.players.splice(Lobby.players.indexOf(socket), 1);
    console.log("A fucker left : " + socket.id + " (" + Lobby.players.length + " players left)");
  }

  /**
   * update
   * @param {Number} delta : number of ms since last update
   */
  update(delta) {
    this.rooms.forEach(g => g.update(delta));
  }

  /**
   * send update to the clients
   * @param {Number} delta : number of ms since last update
   */
  netupdate(delta) {
    this.rooms.forEach(g => g.netupdate(delta));
  }

  /**
   * Transforms a socket into a player object
   * @param {socket} socket
   */
  static makePlayer(socket) {
    var player = new Player(socket);
    Lobby.players.push(player);
    console.log("A fucker joined : " + socket.id + " (" + Lobby.players.length + " players left)");
    return player;
  }

  static getPlayer(id) {
    return Lobby.players.find(p => p.id === id);
  }

}
Lobby.players = [];


module.exports = Lobby;
