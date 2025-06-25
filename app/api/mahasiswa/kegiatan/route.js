import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ukm_baru");
    const collection = db.collection("kegiatan");

    // Fetch all kegiatan sorted by date
    const kegiatan = await collection
      .find({})
      .sort({ date: 1 })
      .toArray();

    // Format response to match structure
    const formatted = kegiatan.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      description: item.description,
      date: item.date,
      location: item.location,
      status: item.status,
      ukm: item.ukm,
      banner: item.banner,
      banner_id: item.banner_id,
      createdAt: item.createdAt
    }));

    return NextResponse.json({ 
      success: true,
      kegiatan: formatted 
    });

  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch kegiatan',
        error: error.message 
      },
      { status: 500 }
    );
  }
}