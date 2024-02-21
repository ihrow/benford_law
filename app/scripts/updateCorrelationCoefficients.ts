import prisma from "@/lib/prisma";
import { benfordDistribution } from "../constants/benfordDistribution";
import { MAD, SSD } from "../helpers";

export async function updateCorrelationCoefficients() {
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
      where: { id: row.id },
      data: {
        MAD: parseFloat(
          MAD(observedFrequencies, expectedFrequencies).toFixed(3)
        ),
        SSD: parseFloat(
          SSD(observedFrequencies, expectedFrequencies).toFixed(3)
        ),
      },
    });
    // console.log("MAD: ", MAD(observedFrequencies, expectedFrequencies));
    // console.log("SSD: ", SSD(observedFrequencies, expectedFrequencies));
  }
}
