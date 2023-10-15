export interface SymbolsResponse {
  [symbol: string]: {
    USDT: number;
  };
}

export interface GetCoinsDataResponse {
  digits: { digit: number; amount: number }[];
  total: number;
}
