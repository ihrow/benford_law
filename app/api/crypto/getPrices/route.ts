import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "lib/prisma";

async function fetchMarketData(limit: number) {
  try {
    const URL = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=${limit}&tsym=USDT`;
    const response = await axios.get(URL);

    const cryptoData = response.data.Data.map((coin: any) => ({
      name: coin.CoinInfo.Name,
      price: coin.RAW.USDT.PRICE,
    }));

    return cryptoData;
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}

export async function GET() {
  try {
    const data = await fetchMarketData(100);

    await prisma.crypto.createMany({
      data: data,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
