const sylvester = require('sylvester');

class Lobby {

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
