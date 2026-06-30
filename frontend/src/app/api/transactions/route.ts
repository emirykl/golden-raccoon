import { NextResponse } from "next/server";
import { getMockTransactions } from "@/server/transactions/mockTransactions";

export function GET() {
  return NextResponse.json(getMockTransactions());
}
