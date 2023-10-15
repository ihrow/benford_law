import prisma from "lib/prisma";
import { NextResponse } from "next/server";
import { symbolsGroupsList } from "@/app/constants/symbols";
import { SymbolsResponse, GetCoinsDataResponse } from "@/app/types";
import axios from "axios";
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
  const URL = process.env.API_URL || "http://localhost:3000/api/digits/";
  for (const digit of amountOfDigits) {
    await axios.post(`${URL}${digit.digit}`, {
      amount: digit.amount,
    });
  }
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

    const digits = await prisma.digit.findMany({
      orderBy: { digit: "asc" },
    });

    const response: GetCoinsDataResponse = {
      digits: digits.map((digit) => ({
        digit: digit.digit,
        amount: digit.amount,
      })),
      total: digits.reduce((acc, digit) => acc + digit.amount, 0),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
