import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { digit: number } }
) {
  const digit = params.digit;
  if (digit < 1 || digit > 9) {
    return NextResponse.json({ message: "Invalid digit" }, { status: 400 });
  }

  const res = await req.json();
  const amount = res.amount;
  if (typeof amount !== "number") {
    return NextResponse.json(
      { message: "Invalid amount. Amount must be a number." },
      { status: 400 }
    );
  }
  if (amount < 1) {
    return NextResponse.json(
      { message: "Invalid amount. Amount must be a positive number." },
      { status: 400 }
    );
  }

  const digitAmount = await prisma.digit.findUnique({
    where: { digit: Number(digit) },
  });

  if (!digitAmount) {
    const createdDigit = await prisma.digit.create({
      data: { digit: Number(digit), amount },
    });
    return NextResponse.json(createdDigit);
  }

  const newAmount = await prisma.digit.update({
    where: { digit: Number(digit) },
    data: { amount: digitAmount.amount + amount },
  });

  return NextResponse.json(newAmount);
}
