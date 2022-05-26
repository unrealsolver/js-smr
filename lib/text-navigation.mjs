export default function textNavigation(text) {
  // First line has always 0 position
  let lookups = [0];

  return function (line, col) {
    let lastPos = 0;
    for (let i = lookups.length; i < line; i++) {
      lastPos = lookups[lookups.length - 1];
      lookups.push(text.indexOf("\n", lastPos) + 1);
    }
    return lookups[line - 1] + col;
  };
}
