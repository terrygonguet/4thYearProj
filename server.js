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

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log("A fucker left : " + socket.id + " (" + Object.keys(players).length + " players left)");
  });

});
