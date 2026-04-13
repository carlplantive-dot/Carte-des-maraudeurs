import { NextResponse } from "next/server";
import { fetchMaraudes } from "@/lib/fetchMaraudes";

export const revalidate = 3600; // re-fetch at most once per hour

export async function GET() {
  const data = await fetchMaraudes();
  return NextResponse.json(data);
}
