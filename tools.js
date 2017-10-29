function makePlayersSmall (player) {
  const data = {
    position: player.position.elements,
    speed: player.speed,
    score: player.score
  };
  return data;
}
exports.makePlayersSmall = makePlayersSmall;

function randInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
exports.randInt = randInt;
