export default function getFirstDigit(price: string): number {
  const normalizedPrice = price.replace(/^0.|0+/g, "");
  return parseInt(normalizedPrice[0]);
}
