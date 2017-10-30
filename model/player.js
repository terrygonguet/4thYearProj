const sylvester = require('sylvester');

class Player {

  static make(socket) {
    socket.join("players");
    Player.players.push(socket);
    socket.position = $V([0,0]);
    socket.score    = 0;
    console.log("A fucker joined : " + socket.id + " (" + Player.players.length + " players left)");

    socket.on("disconnect", () => {
      socket.game && socket.game.removePlayer(socket);
      Player.players.splice(Player.players.indexOf(socket), 1);
      console.log("A fucker left : " + socket.id + " (" + Player.players.length + " players left)");
    });

    socket.on("firebullet", data => {
      socket.to(socket.game.id).emit("firebullet", data);
    });

    socket.on("playerhit", data => {
      var shooter = Player.getPlayer(data.shooter);
      shooter && shooter.score++;
      var target = Player.getPlayer(data.target);
      target && target.emit("gethit");
    });

    socket.on("update", (data, ack) => {
      socket.position = $V(data.player.position);
      socket.speed = data.player.speed;
      ack();
    });
  }

  static getPlayer(id) {
    return Player.players.find(p => p.id === id);
  }

}
Player.players = [];


module.exports = Player;
