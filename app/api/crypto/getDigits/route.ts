import { NextResponse } from "next/server";
import { symbolsGroupsList } from "@/app/constants/symbols";
import { SymbolsResponse } from "@/app/types";
import axios from "axios";
import prisma from "lib/prisma";
import { getFirstDigit } from "@/app/helpers";
import { benfordDistribution } from "@/app/constants/benfordDistribution";
import { floatToFixedPositive, floatToFixed } from "@/app/helpers/toFixed";

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

async function updateDigitsDatabase(data: any) {
  await prisma.digits.create({
    data: {
      updateAt: new Date(),
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

async function updatePercentagesDatabase(data: any) {
  await prisma.percentage.create({
    data: {
      updateAt: new Date(),
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
    await updatePercentagesDatabase(amountOfDigitsWithPercentage);

    return NextResponse.json(amountOfDigitsWithPercentage);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
