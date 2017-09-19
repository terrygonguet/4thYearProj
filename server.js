const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const now = require('present');
const sylvester = require('sylvester');

setTimeout(function tick(old) {
  var delta = (now() - old);
  update(delta);
  setTimeout(tick, 30, now());
}, 30, now());

function update (delta) {
  for (var player in players) {
    var data = {
      delta,
      players: {}
    };
    for (var p in players) {
      if (p !== player) {
        data.players[p] = { position: players[p].position.elements };
      }
    }
    Object.keys(players).length > 1 && players[player].emit("update", data);
  }
}

const players = {};

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {

  socket.join("players");
  players[socket.id] = socket;
  console.log("A fucker joined : " + socket.id + " (" + Object.keys(players).length + " players in)");
  socket.position = $V([0,0]);

  socket.on("disconnect", () => {
    socket.to("players").emit("playerleave", { id: socket.id });
    delete players[socket.id];
    console.log("A fucker left : " + socket.id + " (" + Object.keys(players).length + " players left)");
  });

  socket.on("update", data => {
    socket.position = $V(data.player.position);
  });

});
