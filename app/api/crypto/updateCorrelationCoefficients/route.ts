import { benfordDistribution } from "@/app/constants/benfordDistribution";
import prisma from "@/lib/prisma";
import { calculateCorrelationCoefficient } from "@/app/helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.percentage.findMany();

    const expectedFrequencies = benfordDistribution.map(
      (item) => item.percentage
    );

    for (const row of data) {
      const observedFrequencies = [
        row.one,
        row.two,
        row.three,
        row.four,
        row.five,
        row.six,
        row.seven,
        row.eight,
        row.nine,
      ];

      await prisma.percentage.update({
        where: {
          id: row.id,
        },
        data: {
          correlationCoefficient: calculateCorrelationCoefficient(
            observedFrequencies,
            expectedFrequencies
          ),
        },
      });
    }
    return NextResponse.json({ message: "Correlation coefficients updated" });
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
