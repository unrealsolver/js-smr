export default function offsetCalculator() {
  // Each positions[i] mutually correspond to offsets[i]
  const lines = [0];

  return {
    add: function (line, offset) {
      if (line in lines === false) {
        lines[line] = 0;
      }
      lines[line] += offset;
    },
    at: function (line) {
      return lines[line] || 0;
    },
  };
}
