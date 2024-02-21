export function calculateCorrelationCoefficient(
  observedFrequencies: number[],
  expectedFrequencies: number[]
) {
  const meanObserved =
    observedFrequencies.reduce((acc, val) => acc + val, 0) /
    observedFrequencies.length;
  const meanExpected =
    expectedFrequencies.reduce((acc, val) => acc + val, 0) /
    expectedFrequencies.length;

  // Calculate numerator and denominators of correlation coefficient formula
  let numerator = 0;
  let sumObservedSquaredDiff = 0;
  let sumExpectedSquaredDiff = 0;

  for (let i = 0; i < observedFrequencies.length; i++) {
    const observedDiff = observedFrequencies[i] - meanObserved;
    const expectedDiff = expectedFrequencies[i] - meanExpected;
    numerator += observedDiff * expectedDiff;
    sumObservedSquaredDiff += Math.pow(observedDiff, 2);
    sumExpectedSquaredDiff += Math.pow(expectedDiff, 2);
  }

  // Calculate correlation coefficient
  const correlationCoefficient =
    numerator / Math.sqrt(sumObservedSquaredDiff * sumExpectedSquaredDiff);

  return correlationCoefficient;
}

export function MAD(
  observedFrequencies: number[],
  expectedFrequencies: number[]
) {
  let sum = 0;
  for (let i = 0; i < observedFrequencies.length; i++) {
    sum += Math.abs(expectedFrequencies[i] - observedFrequencies[i]);
  }
  return sum / observedFrequencies.length;
}

export function SSD(
  observedFrequencies: number[],
  expectedFrequencies: number[]
) {
  let sum = 0;
  for (let i = 0; i < observedFrequencies.length; i++) {
    sum += (expectedFrequencies[i] - observedFrequencies[i]) ** 2;
  }
  return sum;
}
