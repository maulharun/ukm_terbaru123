import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ukm_baru");

    // Get all kegiatan
    const kegiatan = await db.collection("kegiatan").find({}).toArray();

    // Count kegiatan per UKM
    const ukmCount = {};
    kegiatan.forEach(k => {
      if (k.ukm) {
        ukmCount[k.ukm] = (ukmCount[k.ukm] || 0) + 1;
      }
    });

    // Get top 3 UKM by kegiatan count
    const topUKM = Object.entries(ukmCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([ukm, totalKegiatan]) => ({
        ukm,
        totalKegiatan
      }));

    return NextResponse.json({
      success: true,
      all: kegiatan,
      topUKM,
      total: kegiatan.length
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}