import { NextResponse } from "next/server";
import axios from "axios";
import * as cron from "node-cron";

export async function GET() {
  try {
    const URLDigits = "http://localhost:3000/api/crypto/getDigits";
    const URLPrices = "http://localhost:3000/api/crypto/getPrices";
    cron.schedule("*/1 * * * *", async () => {
      await axios.get(`${URLDigits}`);
      await axios.get(`${URLPrices}`);
    });
    return NextResponse.json(0);
  } catch (error: any) {
    return NextResponse.json({ message: error });
  }
}
