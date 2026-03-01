/**
 * API route for clearing the database cache.
 */
import { NextResponse } from "next/server";
import { clearCache } from "@/lib/db";

export async function POST() {
  try {
    await clearCache();
    return NextResponse.json({ message: "Cache cleared successfully." });
  } catch (error) {
    console.error("Failed to clear cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache." },
      { status: 500 }
    );
  }
}
