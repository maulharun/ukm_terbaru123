import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ukm_baru");

    // Get all UKMs with their members
    const ukms = await db
      .collection("ukm")
      .find({})
      .toArray();

    // Format UKM list with member counts
    const ukmList = ukms.map(ukm => ({
      name: ukm.name,
      memberCount: ukm.members?.length || 0,
      description: ukm.description,
      category: ukm.category
    }));

    // Sort by member count
    ukmList.sort((a, b) => b.memberCount - a.memberCount);

    return NextResponse.json({
      success: true,
      total: ukms.length,
      list: ukmList,
      totalMembers: ukms.reduce((acc, ukm) => acc + (ukm.members?.length || 0), 0)
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}