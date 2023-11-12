import { NextResponse } from "next/server";
import { symbolsGroupsList } from "@/app/constants/symbols";
import { SymbolsResponse } from "@/app/types";
import axios from "axios";
import prisma from "lib/prisma";
import { getFirstDigit } from "@/app/helpers";

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
  await prisma.digits.create({
    data: {
      updateAt: new Date(),
      one: amountOfDigits[0].amount,
      two: amountOfDigits[1].amount,
      three: amountOfDigits[2].amount,
      four: amountOfDigits[3].amount,
      five: amountOfDigits[4].amount,
      six: amountOfDigits[5].amount,
      seven: amountOfDigits[6].amount,
      eight: amountOfDigits[7].amount,
      nine: amountOfDigits[8].amount,
    },
  });
}

export async function GET() {
  try {
    const amountOfDigits = Array.from({ length: 9 }, (_, i) => ({
      digit: i + 1,
      amount: 0,
    }));

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
        });
      }
    );

    await Promise.all(coinDataPromises);

    await updateDatabase(amountOfDigits);

    return NextResponse.json(amountOfDigits);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
