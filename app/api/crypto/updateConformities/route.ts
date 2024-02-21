import { NextResponse } from "next/server";
import { updateCorrelationCoefficients } from "../../../scripts/updateCorrelationCoefficients";

export async function GET() {
  await updateCorrelationCoefficients();

  return NextResponse.json({ message: "Correlation coefficients updated" });
}
