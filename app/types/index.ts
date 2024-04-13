// api.coincap.io/v2/assets
export interface SymbolsResponse {
  data: {
    name: string;
    symbol: string;
    priceUsd: string;
  }[];
}

export interface BenfordDistribution {
  MAD: number;
  SSD: number;
  createdAt: string;
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;

  eight: number;
  nine: number;
}

export interface BTCPriceDB {
  id: number;
  updateAt: string;
  BTC: number;
}
