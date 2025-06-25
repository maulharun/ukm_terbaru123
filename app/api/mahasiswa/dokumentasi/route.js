import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request) {
  try {
    // Get UKM filter from query
    const { searchParams } = new URL(request.url);
    const ukmFilter = searchParams.get('ukm');
    
    const client = await clientPromise;
    const db = client.db("ukm_baru");

    // Build query with UKM filter
    const query = ukmFilter ? {
      ukm: { $in: ukmFilter.split(',') }
    } : {};

    // Get kegiatan data
    const kegiatan = await db
      .collection("dokumentasi")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Format response
    const formatted = kegiatan.map(doc => ({
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      kegiatan: doc.kegiatan,
      tahun: doc.tahun,
      ukm: doc.ukm,
      files: doc.files?.map(file => ({
        url: file.url,
        public_id: file.public_id,
        type: file.type,
        fileName: file.fileName,
        fileSize: file.fileSize,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      })) || []
    }));

    return NextResponse.json({
      success: true,
      kegiatan: formatted
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}