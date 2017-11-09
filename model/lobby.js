const sylvester = require('sylvester');
const now = require('present');

class Lobby {

  /**
   * @param {IO} io : the IO object to handle sockets
   */
  constructor(io, updateRate=60, netUpdateRate=15) {
    const self = this;
    this.rooms         = [];
    this.io            = io;
    this.updateRate    = updateRate;
    this.netUpdateRate = netUpdateRate;
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
   */
  createRoom(type, params) {
    this.rooms.push(new this.gamelist[type](this.io, params));
  }

  /**
   * If the socket isn't a player it is made so and joins the lobby
   * @param {socket} socket : the player
   */
  join(socket) {
    if (!socket.isPlayer) Lobby.makePlayer(socket);
    this.rooms[0].addPlayer(socket);
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
    socket.join("players");
    Lobby.players.push(socket);
    socket.position = $V([0,0]);
    socket.score    = 0;
    console.log("A fucker joined : " + socket.id + " (" + Lobby.players.length + " players left)");

    socket.on("disconnect", () => {
      socket.game && socket.game.removePlayer(socket);
      Lobby.players.splice(Lobby.players.indexOf(socket), 1);
      console.log("A fucker left : " + socket.id + " (" + Lobby.players.length + " players left)");
    });

    socket.on("firebullet", data => {
      socket.to(socket.game.id).emit("firebullet", data);
    });

    socket.on("playerhit", data => {
      var shooter = Lobby.getPlayer(data.shooter);
      shooter && shooter.score++;
      var target = Lobby.getPlayer(data.target);
      target && target.emit("gethit");
    });

    socket.on("update", (data, ack) => {
      socket.position = $V(data.player.position);
      socket.speed = data.player.speed;
      ack();
    });

    socket.serialize = () => Lobby.serializePlayer(socket);
    socket.isPlayer = true;
  }

  static getPlayer(id) {
    return Lobby.players.find(p => p.id === id);
  }

  /**
   * Returns the JSON representation of the object
   * @param {socket} socket
   */
  static serializePlayer(player) {
    const data = {
      position: player.position.elements,
      speed: player.speed,
      score: player.score,
      id: player.id
    };
    return data;
  }

}
Lobby.players = [];


module.exports = Lobby;
