const sylvester = require('sylvester');

class Player {

  static players = [];

  static make(socket) {
    socket.join("players");
    Player.players.push(socket);
    socket.position = $V([0,0]);
    socket.score    = 0;
    console.log("A fucker joined : " + socket.id + " (" + Player.players.length + " players left)");

    socket.on("disconnect", () => {
      // socket.to("players").emit("playerleave", { id: socket.id });
      Player.players.splice(Player.players.indexOf(socket), 1);
      console.log("A fucker left : " + socket.id + " (" + Player.players.length + " players left)");
    });

    // socket.on("firebullet", data => {
    //   socket.to("players").emit("firebullet", data);
    // });
    //
    // socket.on("playerhit", data => {
    //   players[data.shooter] && players[data.shooter].score++;
    //   players[data.target] && players[data.target].emit("gethit");
    // });
    //
    // socket.on("update", (data, ack) => {
    //   socket.position = $V(data.player.position);
    //   socket.speed = data.player.speed;
    //   ack();
    // });
  }

  constructor() {

  }

}
