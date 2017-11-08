const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const now = require('present');

const Lobby = require("./model/lobby");
const Game = require("./model/game");

const lobby = new Lobby(io);

setTimeout(function tick(old) {
  var delta = (now() - old);
  lobby.update(delta);
  setTimeout(tick, 15, now());
}, 15, now());

server.listen(process.env.PORT || 80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {
  lobby.join(socket);
});
