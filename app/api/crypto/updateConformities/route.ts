import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Correlation coefficients updated" });
}
