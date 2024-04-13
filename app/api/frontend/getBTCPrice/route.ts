import { NextResponse, NextRequest } from "next/server";
import prisma from "lib/prisma";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") as string;
  const to = req.nextUrl.searchParams.get("to") as string;
  const step = req.nextUrl.searchParams.get("step") as string;

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

  const timeZoneOffset = new Date().getTimezoneOffset();
  fromDate.setMinutes(fromDate.getMinutes() + timeZoneOffset);
  toDate.setMinutes(toDate.getMinutes() + timeZoneOffset);

  try {
    let data = await prisma.cryptoPrices.findMany({
      where: {
        updateAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });
    data = data.filter((data, index) => index % parseInt(step) === 0);
    return NextResponse.json(
      data.toSorted(
        (a, b) =>
          new Date(a.updateAt).getTime() - new Date(b.updateAt).getTime()
      )
    );
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
