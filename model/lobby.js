const sylvester = require('sylvester');
const Game = require("./game");

class Lobby {

  constructor(io) {
    this.rooms = [];
    this.io    = io;

    this.rooms.push(new Game(io));
  }

  join(socket) {
    if (!socket.isPlayer) Lobby.makePlayer(socket);
    this.rooms[0].addPlayer(socket);
  }

  update(delta) {
    this.rooms.forEach(g => g.update(delta));
  }

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
