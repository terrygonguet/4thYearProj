const tools = require("../tools");
const SAT = require("sat");

class Game {

  static currentID = 0;
  static nextID () {
    return Game.currentID++;
  }

  constructor() {
    this.id         = Game.nextID();
    this.type       = "deathmatch";
    this.players    = [];
    this.blocks     = [];
    this.dimensions = [5000,5000];
  }

  generateBlocks() {
    for (var i = 0; i < 150; i++) {
      if (Math.random() < 0.2)
        this.addBlock({
          position: [
            tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          ],
          radiusmin: Math.random() * 5 + 10,
          radiusmax: Math.random() * 20 + 60,
          id: "p" + i ,
          type: "Plant"
        });
      else
        this.addBlock({
          position: [
            tools.randInt(-this.dimensions[0]/2, this.dimensions[0]/2),
            tools.randInt(-this.dimensions[1]/2, this.dimensions[1]/2)
          ],
          dimension: [ tools.randInt(20, 200), tools.randInt(20, 200) ],
          angle: Math.random() * Math.PI * 2,
          id: "b" + i ,
          type: "Block"
        });
    }
  }

  update(delta) {
    var data = {
      players: [],
      time: Date.now(),
    }
    for (var player of this.players) {
      data.players.push(tools.makePlayerSmall(player));
    }
    io.to(this.id).emit("update", data);
  }

  addPlayer(player) {
    this.players.push(player);
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

module.exports = Game;
