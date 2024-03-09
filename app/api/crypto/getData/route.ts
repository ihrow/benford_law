import axios from "axios";
import prisma from "lib/prisma";
import { NextResponse } from "next/server";
import { topSymbols } from "@/app/constants/topSymbols";
import { SymbolsResponse } from "@/app/types";
import {
  getFirstDigit,
  floatToFixed,
  floatToFixedPositive,
  MAD,
  SSD,
} from "@/app/helpers";
import { benfordDistribution } from "@/app/constants/benfordDistribution";
export const revalidate = 0;

interface CryptoData {
  digit: number;
  amount: number;
  percentage: number;
  delta: number;
}

async function fetchMarketData() {
  try {
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${topSymbols.join(
      ","
    )}&tsyms=USDT&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;
    const response = await axios.get(URL);

    return response.data;
  } catch (error: any) {
    let telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&parse_mode=HTML`;
    telegramURL = telegramURL.concat(`&text=${JSON.stringify(error)}`);
    await axios.get(telegramURL);
    return null;
  }
}

async function fetchCoinData(): Promise<SymbolsResponse | null> {
  try {
    const URL = `https://api.coincap.io/v2/assets?limit=2000`;
    const response = await axios.get(URL);
    return response.data;
  } catch (error: any) {
    let telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&parse_mode=HTML`;
    telegramURL = telegramURL.concat(`&text=${JSON.stringify(error)}`);
    await axios.get(telegramURL);
    return null;
  }
}

async function updateDigitsDatabase(data: CryptoData[]) {
  await prisma.digits.create({
    data: {
      one: data[0].amount,
      two: data[1].amount,
      three: data[2].amount,
      four: data[3].amount,
      five: data[4].amount,
      six: data[5].amount,
      seven: data[6].amount,
      eight: data[7].amount,
      nine: data[8].amount,
    },
  });
}

async function updatePercentagesDatabase(data: CryptoData[]) {
  const observedFrequencies = data.map((item) => item.percentage);
  const expectedFrequencies = benfordDistribution.map(
    (item) => item.percentage
  );
  return await prisma.percentage.create({
    data: {
      one: data[0].percentage,
      deltaOne: floatToFixedPositive(
        benfordDistribution[0].percentage - data[0].percentage
      ),
      two: data[1].percentage,
      deltaTwo: floatToFixedPositive(
        benfordDistribution[1].percentage - data[1].percentage
      ),
      three: data[2].percentage,
      deltaThree: floatToFixedPositive(
        benfordDistribution[2].percentage - data[2].percentage
      ),
      four: data[3].percentage,
      deltaFour: floatToFixedPositive(
        benfordDistribution[3].percentage - data[3].percentage
      ),
      five: data[4].percentage,
      deltaFive: floatToFixedPositive(
        benfordDistribution[4].percentage - data[4].percentage
      ),
      six: data[5].percentage,
      deltaSix: floatToFixedPositive(
        benfordDistribution[5].percentage - data[5].percentage
      ),
      seven: data[6].percentage,
      deltaSeven: floatToFixedPositive(
        benfordDistribution[6].percentage - data[6].percentage
      ),
      eight: data[7].percentage,
      deltaEight: floatToFixedPositive(
        benfordDistribution[7].percentage - data[7].percentage
      ),
      nine: data[8].percentage,
      deltaNine: floatToFixedPositive(
        benfordDistribution[8].percentage - data[8].percentage
      ),

      MAD: parseFloat(MAD(observedFrequencies, expectedFrequencies).toFixed(3)),
      SSD: parseFloat(SSD(observedFrequencies, expectedFrequencies).toFixed(3)),
    },
  });
}

export async function GET() {
  try {
    const amountOfDigits = Array.from({ length: 9 }, (_, i) => ({
      digit: i + 1,
      amount: 0,
    }));

    const coinData = await fetchCoinData();
    if (!coinData) {
      return NextResponse.json({ message: "Error fetching data" });
    }

    const pricesData = await fetchMarketData();
    if (!pricesData) {
      return NextResponse.json({ message: "Error fetching data" });
    }

    coinData.data.forEach((coin) => {
      if (!coin.priceUsd) return;
      const firstDigit = getFirstDigit(coin.priceUsd);
      amountOfDigits[firstDigit - 1].amount++;
    });

    const total = amountOfDigits.reduce((acc: number, curr: any) => {
      return acc + curr.amount;
    }, 0);

    const amountOfDigitsWithPercentage = amountOfDigits.map((digit: any) => {
      return {
        ...digit,
        percentage: floatToFixed((digit.amount / total) * 100),
        delta: floatToFixedPositive(
          benfordDistribution[digit.digit - 1].percentage -
            floatToFixed((digit.amount / total) * 100)
        ),
      };
    });

    await updateDigitsDatabase(amountOfDigitsWithPercentage);

    await prisma.cryptoPrices.create({
      data: {
        data: JSON.stringify(pricesData),
        BTC: pricesData.BTC.USDT,
        ETH: pricesData.ETH.USDT,
        BNB: pricesData.BNB.USDT,
        ADA: pricesData.ADA.USDT,
        DOGE: pricesData.DOGE.USDT,
        XRP: pricesData.XRP.USDT,
        DOT: pricesData.DOT.USDT,
        LTC: pricesData.LTC.USDT,
        LINK: pricesData.LINK.USDT,
        APT: pricesData.APT.USDT,
        ARB: pricesData.ARB.USDT,
        ATOM: pricesData.ATOM.USDT,
        AVAX: pricesData.AVAX.USDT,
        DYDX: pricesData.DYDX.USDT,
        GALA: pricesData.GALA.USDT,
        MANTLE: pricesData.MANTLE.USDT,
        MATIC: pricesData.MATIC.USDT,
        OKB: pricesData.OKB.USDT,
        OP: pricesData.OP.USDT,
        RUNE: pricesData.RUNE.USDT,
        SOL: pricesData.SOL.USDT,
        TIA: pricesData.TIA.USDT,
        TRX: pricesData.TRX.USDT,
        WLD: pricesData.WLD.USDT,
        YFI: pricesData.YFI.USDT,
      },
    });

    return NextResponse.json(
      await updatePercentagesDatabase(amountOfDigitsWithPercentage)
    );
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
