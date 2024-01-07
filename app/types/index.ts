// api.coincap.io/v2/assets
export interface SymbolsResponse {
  data: {
    name: string;
    symbol: string;
    priceUsd: string;
  }[];
}
