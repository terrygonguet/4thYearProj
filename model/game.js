const tools = require("../tools");
const SAT = require("sat");

class Game {

  static nextID () {
    return Game.currentID++;
  }

  constructor(io) {
    this.id         = Game.nextID();
    this.type       = "deathmatch";
    this.players    = [];
    this.blocks     = [];
    this.dimensions = [5000,5000];
    this.io         = io;

    this.generateBlocks();
  }

  generateBlocks(nbBlocks=150, bushChance=0.2) {
    for (var i = 0; i < nbBlocks; i++) {
      if (Math.random() < bushChance)
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
      time: Date.now()
    }
    for (var player of this.players) {
      data.players.push(tools.makePlayerSmall(player));
    }
    this.io.to(this.id).emit("update", data);
  }

  addPlayer(player) {
    this.players.push(player);
    player.game && player.game.removePlayer(player);
    player.join(this.id);
    player.game = this;
    player.emit("createarena", {
      blocks: this.blocks,
      dimensions: this.dimensions,
      players: this.players.map(p => tools.makePlayerSmall(p))
    });
  }

  removePlayer(player) {
    player.leave(this.id);
    this.players.splice(this.players.indexOf(player), 1);
    this.io.to(this.id).emit("playerleave", { id: player.id });
  }

  addBlock(block) {
    this.blocks.push(block);
  }

}
Game.currentID = 0;

module.exports = Game;
