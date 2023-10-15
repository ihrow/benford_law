import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  await prisma.digit.updateMany({
    data: {
      amount: 0,
    },
  });
  return NextResponse.json({ message: "ok" });
}
