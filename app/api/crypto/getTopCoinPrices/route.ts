import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "lib/prisma";
export const revalidate = 0;

async function fetchMarketData() {
  try {
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USDT&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
    const response = await axios.get(URL);

    return response.data;
  } catch (error: any) {
    let telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&parse_mode=HTML`;
    telegramURL = telegramURL.concat(`&text=${JSON.stringify(error)}`);
    await axios.get(telegramURL);
    return NextResponse.json({ message: error });
  }
}

export async function GET() {
  try {
    const data = await fetchMarketData();

    await prisma.cryptoPrices.create({
      data: {
        BTC: data.BTC.USDT,
      },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
