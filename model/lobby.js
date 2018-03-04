const sylvester = require('sylvester');
const SAT = require("sat");
const now = require('present');
const io = require('socket.io');
const Player = require('./player');
const tools = require('../tools');

class Lobby {

  /**
   * @param {Object} params
   * @param {IO}     params.io the IO object to handle sockets
   * @param {Number} params.updateRate world updates per second
   * @param {Number} params.netUpdateRate net updates per second
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
      "Deathmatch": require("./gametypes/deathmatch")
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
  }

  /**
   * Creates a room in the lobby
   * @param {String} type : the type of room to create
   * @param {Object} params : the conf object to give to the Game constructor, defaults is null
   * @return {Game} the game created
   */
  createRoom(type, params) {
    const game = new this.gamelist[type](this.io, params);
    this.rooms.push(game);
    return game;
  }

  /**
   * Cleans up room and removes it
   * @param {Game} room the game to remove
   */
  destroyRoom(room) {
    var index = this.rooms.indexOf(room);
    room.destroy();
    this.rooms.splice(index, 1);
  }

  /**
   * If the socket isn't a player it is made so and joins the lobby
   * @param {socket} socket : the player
   */
  join(socket) {
    var player = socket;
    if (!socket.isPlayer) player = Lobby.makePlayer(socket);
    player.lobby = this;
    // this.rooms[0].addPlayer(player);
  }

  /**
   * Make the player join a room by ID
   * @param {ID} id the ID of the game
   * @param {Player} player the player
   */
  joinRoom(id, player) {
    var room = this.rooms.find(r => r.id === id);
    room && room.addPlayer(player);
  }

  /**
   * Leaves the lobby
   * @param {socket} socket : the player
   */
  leave(socket) {
    socket.lobby = null;
    Lobby.players.splice(Lobby.players.indexOf(socket), 1);
    console.log("A player left : " + socket.id + " (" + Lobby.players.length + " players connected)");
  }

  /**
   * update
   * @param {Number} delta : number of ms since last update
   */
  update(delta) {
    this.rooms.forEach(g => {
      g.update(delta);
      if (g.timeWithNoPlayers > 60000) this.destroyRoom(g);
    });
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
    console.log("A player joined : " + socket.id + " (" + Lobby.players.length + " players connected)");
    return player;
  }

  /**
   * Get a player object by ID
   * @param {ID} id
   * @return {Player}
   */
  static getPlayer(id) {
    return Lobby.players.find(p => p.id === id);
  }

}
Lobby.players = [];


module.exports = Lobby;
