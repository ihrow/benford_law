import { NextResponse } from "next/server";
import axios from "axios";

interface CryptoData {
  digit: number;
  amount: number;
  percentage: number;
  delta: number;
}

export async function GET() {
  try {
    let telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&parse_mode=HTML`;
    const URLData = "https://benford-law.vercel.app/api/crypto/getData";
    const URLPrices =
      "https://benford-law.vercel.app/api/crypto/getTopCoinPrices";
    const data = await axios.get(`${URLData}`);
    await axios.get(`${URLPrices}`);

    telegramURL = telegramURL.concat(
      `&text=${data.data
        .map(
          (item: CryptoData) =>
            `Digit ${item.digit}: ${item.amount} with <b>${item.percentage}%</b> distribution and <b>${item.delta}</b> delta.`
        )
        .join("%0A")}`
    );
    await axios.get(telegramURL);
    return NextResponse.json({ message: "Job done." });
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
