const tools = require("../tools");
const SAT = require("sat");

class Game {

  static currentID = 0;

  constructor() {
    this.type = "deathmatch";
    this.players = {};
    this.blocks = [];
    this.dimensions = [5000,5000];
  }

  update(delta) {
    for (var player in this.players) {
      var data = {
        players: tools.makePlayersSmall(player),
        time: Date.now(),
        playerscore: this.players[player].score
      };
      Object.keys(this.players).length > 1 && this.players[player].emit("update", data);
    }
  }

  addPlayer(player) {
    this.players[player.id] = player;
    for (var room of Object.keys(player.rooms)) {
      if (room !== player.id && room !== this.id)
        player.leave(room);
    }
    player.join(this.id);
  }

  addBlock(block) {
    this.blocks.push(block);
  }

}
