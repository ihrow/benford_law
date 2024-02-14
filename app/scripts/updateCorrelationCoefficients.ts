import prisma from "@/lib/prisma";
import { benfordDistribution } from "../constants/benfordDistribution";

async function updateCorrelationCoefficients() {
  const data = await prisma.percentage.findMany();

  const expectedFrequencies = benfordDistribution.map(
    (item) => item.percentage
  );

  for (const row of data) {
    const observedFrequencies = [
      row.deltaOne,
      row.deltaTwo,
      row.deltaThree,
      row.deltaFour,
      row.deltaFive,
      row.deltaSix,
      row.deltaSeven,
      row.deltaEight,
      row.deltaNine,
    ];

    console.log(observedFrequencies, expectedFrequencies);
  }
}
