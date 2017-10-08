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
      players: {},
      time: Date.now(),
      playerscore: players[player].score
    };
    for (var p in players) {
      if (p !== player) {
        data.players[p] = {
          position: players[p].position.elements,
          speed: players[p].speed,
          score: players[p].score
        };
      }
    }
    Object.keys(players).length > 1 && players[player].emit("update", data);
  }
}

const randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const players = {};
const blocks = [];

for (var i = 0; i < 150; i++) {
  if (Math.random() < 0.2)
    blocks.push({
      position: [ randInt(-2500, 2500), randInt(-2500, 2500) ],
      radiusmin: Math.random() * 5 + 10,
      radiusmax: Math.random() * 20 + 60,
      id: "p" + i ,
      type: "Plant"
    });
  else
    blocks.push({
      position: [ randInt(-2500, 2500), randInt(-2500, 2500) ],
      dimension: [ randInt(20, 200), randInt(20, 200) ],
      angle: Math.random() * Math.PI * 2,
      id: "b" + i ,
      type: "Block"
    });
}

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {

  socket.join("players");
  players[socket.id] = socket;
  console.log("A fucker joined : " + socket.id + " (" + Object.keys(players).length + " players in)");
  socket.position = $V([0,0]);
  socket.score    = 0;
  socket.emit("createblocks", blocks);

  socket.on("disconnect", () => {
    socket.to("players").emit("playerleave", { id: socket.id });
    delete players[socket.id];
    console.log("A fucker left : " + socket.id + " (" + Object.keys(players).length + " players left)");
  });

  socket.on("firebullet", data => {
    socket.to("players").emit("firebullet", data);
  });

  socket.on("playerhit", data => {
    players[data.shooter] && players[data.shooter].score++;
    players[data.target] && players[data.target].emit("gethit");
  });

  socket.on("update", (data, ack) => {
    socket.position = $V(data.player.position);
    socket.speed = data.player.speed;
    ack();
  });

});
