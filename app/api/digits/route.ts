import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const digits = await prisma.digits.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return NextResponse.json(digits);
}
