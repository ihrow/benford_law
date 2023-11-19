export function floatToFixed(number: number) {
  return parseFloat(number.toFixed(2));
}

export function floatToFixedPositive(number: number) {
  return Math.abs(parseFloat(number.toFixed(2)));
}
