import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "lib/prisma";
import { topSymbols } from "@/app/constants/topSymbols";
export const revalidate = 0;

async function fetchMarketData() {
  try {
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${topSymbols.join(
      ","
    )}&tsyms=USDT&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
    const response = await axios.get(URL);

    return response.data;
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}

export async function GET() {
  try {
    const data = await fetchMarketData();

    await prisma.cryptoPrices.create({
      data: {
        data: JSON.stringify(data),
        BTC: data.BTC.USDT,
        ETH: data.ETH.USDT,
        BNB: data.BNB.USDT,
        ADA: data.ADA.USDT,
        DOGE: data.DOGE.USDT,
        XRP: data.XRP.USDT,
        DOT: data.DOT.USDT,
        LTC: data.LTC.USDT,
        LINK: data.LINK.USDT,
        APT: data.APT.USDT,
        ARB: data.ARB.USDT,
        ATOM: data.ATOM.USDT,
        AVAX: data.AVAX.USDT,
        DYDX: data.DYDX.USDT,
        GALA: data.GALA.USDT,
        MANTLE: data.MANTLE.USDT,
        MATIC: data.MATIC.USDT,
        OKB: data.OKB.USDT,
        OP: data.OP.USDT,
        RUNE: data.RUNE.USDT,
        SOL: data.SOL.USDT,
        TIA: data.TIA.USDT,
        TRX: data.TRX.USDT,
        WLD: data.WLD.USDT,
        YFI: data.YFI.USDT,
      },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
