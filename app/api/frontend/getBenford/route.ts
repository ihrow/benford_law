import { NextResponse, NextRequest } from "next/server";
import prisma from "lib/prisma";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") as string;
  const to = req.nextUrl.searchParams.get("to") as string;
  console.log(from, to);
  const [fromDay, fromMonth, fromYear] = from.split(".").map(Number);
  const [toDay, toMonth, toYear] = to.split(".").map(Number);

  // Create Date objects using the components
  const fromDate = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
  const toDate = new Date(Date.UTC(toYear, toMonth - 1, toDay));

  console.log(fromDate, toDate);
  if (fromDate > toDate) {
    return NextResponse.json({
      message: "From date should be less than to date",
    });
  } else if (!fromDate || !toDate) {
    return NextResponse.json({
      message: "Please provide both from and to dates",
    });
  } else if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({
      message: "Invalid date format",
    });
  }

  try {
    const data = await prisma.percentage.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
