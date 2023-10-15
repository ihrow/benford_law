import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  await prisma.digit.createMany({
    data: [
      { digit: 1, amount: 0 },
      { digit: 2, amount: 0 },
      { digit: 3, amount: 0 },
      { digit: 4, amount: 0 },
      { digit: 5, amount: 0 },
      { digit: 6, amount: 0 },
      { digit: 7, amount: 0 },
      { digit: 8, amount: 0 },
      { digit: 9, amount: 0 },
    ],
    skipDuplicates: true,
  });
  return NextResponse.json({ message: "ok" });
}
