// filepath: /c:/challengedoni/ukm_doni_rizki-main/app/api/dashadmin/ukm/popular/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('ukm_baru');

    // Aggregate UKMs with member count
    const popularUkms = await db.collection('users')
      .aggregate([
        { $match: { role: 'mahasiswa' } },
        { $unwind: '$ukm' },
        { $group: {
            _id: '$ukm',
            memberCount: { $sum: 1 }
        }},
        { $sort: { memberCount: -1 } },
        { $limit: 5 }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      ukms: popularUkms
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}