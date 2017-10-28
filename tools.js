function makePlayersSmall (excludedId = 0) {
  const data = {};
  for (var p in players) {
    if (p !== excludedId) {
      data[p] = {
        position: players[p].position.elements,
        speed: players[p].speed,
        score: players[p].score
      };
    }
  }
  return data;
}
exports.makePlayersSmall = makePlayersSmall;
