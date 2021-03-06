const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const lobby = new (require("./model/lobby"))({io});

server.listen(process.env.PORT || 80, function () {
  console.log("Server started");
});

app.use(express.static("static"));

io.on('connection', function (socket) {
  lobby.join(socket);
});

app.get("/rooms", function (req, res) {
  res.json(lobby.rooms.map(r => r.serialize()));
});
