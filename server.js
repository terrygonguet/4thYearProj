const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const now = require('present');
const sylvester = require('sylvester');

// setTimeout(function tick(old) {
//   var delta = (now() - old);
//   update(delta);
//   setTimeout(tick, 30, now());
// }, 30, now());

// function update (delta) {
//
// }

const players = {};

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {

  socket.join("players");
  players[socket.id] = socket;
  console.log("A fucker joined : " + socket.id + " (" + Object.keys(players).length + " players in)");
  socket.to("players").emit("playerjoin", { id: socket.id });
  for (let player in players) {
    player.id !== socket.id && socket.emit("playerjoin", { id: player.id });
  }

  socket.on("disconnect", () => {
    socket.to("players").emit("playerleave", { id: socket.id });
    delete players[socket.id];
    console.log("A fucker left : " + socket.id + " (" + Object.keys(players).length + " players left)");
  });

});
