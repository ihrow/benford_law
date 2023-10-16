import { GetCoinsDataResponse } from "@/app/types";
import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  const digits = await prisma.digit.findMany({
    orderBy: {
      digit: "asc",
    },
  });

  const response: GetCoinsDataResponse = {
    digits: digits.map((digit) => ({
      digit: digit.digit,
      amount: digit.amount,
    })),
    total: digits.reduce((acc, digit) => acc + digit.amount, 0),
  };

  return NextResponse.json(response);
}
