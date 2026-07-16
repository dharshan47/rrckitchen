import { NextResponse } from "next/server";


export async function POST() {
  try {
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("[COD Eligibility] Check failed:", error);
    return NextResponse.json({ available: true });
  }
}