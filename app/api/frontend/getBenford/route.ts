import { NextResponse, NextRequest } from "next/server";
import prisma from "lib/prisma";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") as string;
  const to = req.nextUrl.searchParams.get("to") as string;
  const step = req.nextUrl.searchParams.get("step") ?? ("4" as string);

  const timeZoneOffset = new Date().getTimezoneOffset();

  if (!from || !to) {
    return NextResponse.json({
      message: "Please provide both from and to dates",
    });
  }

  const [fromDay, fromMonth, fromYear] = from.split(".").map(Number);
  const [toDay, toMonth, toYear] = to.split(".").map(Number);

  // Create Date objects using the components
  const fromDate = new Date(
    Date.UTC(fromYear, fromMonth - 1, fromDay, 0, 0, 0)
  );
  const toDate = new Date(Date.UTC(toYear, toMonth - 1, toDay, 0, 0, 0));

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

  fromDate.setMinutes(fromDate.getMinutes() + timeZoneOffset);
  toDate.setMinutes(toDate.getMinutes() + timeZoneOffset);

  try {
    let data = await prisma.percentage.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });
    data = data.filter((data, index) => index % parseInt(step) === 0);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
