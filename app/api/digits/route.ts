import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const digits = await prisma.digit.findMany({
    orderBy: {
      digit: "asc",
    },
  });
  return NextResponse.json(digits);
}
