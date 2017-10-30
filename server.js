const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const now = require('present');

const Player = require("./model/player");
const Game = require("./model/game");

const games = [
  new Game(io)
];

setTimeout(function tick(old) {
  var delta = (now() - old);
  games.forEach(g => g.update(delta));
  setTimeout(tick, 15, now());
}, 15, now());

server.listen(80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {
  Player.make(socket);
  games[0].addPlayer(socket);
});
