import { NextResponse } from "next/server";
import { symbolsGroupsList } from "@/app/constants/symbols";
import { SymbolsResponse, GetCoinsDataResponse } from "@/app/types";
import axios from "axios";
import { getFirstDigit } from "@/app/helpers";

export const revalidate = 0;
export const maxDuration = 150;

async function fetchCoinData(
  symbolList: string[]
): Promise<SymbolsResponse | null> {
  try {
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolList.join(
      ","
    )}&tsyms=USDT&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`;

    const response = await axios.get(URL);
    return response.data;
  } catch (error: any) {
    return null;
  }
}

async function updateDatabase(amountOfDigits: any) {
  const URL = process.env.API_URL_DIGITS || "http://localhost:3000/api/digits";
  for (const digit of amountOfDigits) {
    setTimeout(async () => {
      await axios.post(`${URL}/${digit.digit}`, {
        amount: digit.amount,
      });
    }, 500);
  }
}

export async function GET() {
  try {
    const amountOfDigits = Array.from({ length: 9 }, (_, i) => ({
      digit: i + 1,
      amount: 0,
    }));

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const coinDataPromises = symbolsGroupsList.map(
      async (symbolList, index) => {
        return new Promise<void>(async (resolve, reject) => {
          try {
            const data = await fetchCoinData(symbolList);
            if (data === null) {
              reject(new Error("Cryptocompare error"));
            } else {
              for (const key of Object.keys(data)) {
                if (data[key].USDT === undefined) {
                  continue;
                }
                const digit = getFirstDigit(data[key].USDT.toString());
                const digitIndex = amountOfDigits.findIndex(
                  (digitObj) => digitObj.digit === digit
                );
                amountOfDigits[digitIndex].amount++;
              }
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        }).then(async () => {
          await delay(500);
        });
      }
    );

    await Promise.all(coinDataPromises);

    await updateDatabase(amountOfDigits);

    const response: GetCoinsDataResponse = {
      digits: amountOfDigits.map((digit) => ({
        digit: digit.digit,
        amount: digit.amount,
      })),
      total: amountOfDigits.reduce((acc, digit) => acc + digit.amount, 0),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
