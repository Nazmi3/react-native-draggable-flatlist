export function getColor(i: number, numItems: number = 25) {
  console.log("i", i, numItems)
  const multiplier = 60 / (numItems - 1);
  const colorVal = i * multiplier;

  return `rgb(107, ${152 - colorVal}, 35)`;
  // return `rgb(${colorVal}, ${Math.abs(255 - colorVal)}, ${Math.abs(128 - colorVal)})`;
}
