import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const ktmFile = formData.get('ktmFile');
    const sertifikatFile = formData.get('sertifikatFile');
    const userId = formData.get('userId');
    const nama = formData.get('nama');
    const email = formData.get('email');
    const nim = formData.get('nim');
    const fakultas = formData.get('fakultas');
    const prodi = formData.get('prodi');
    const ukmName = formData.get('ukmName');
    const alasan = formData.get('alasan');

    // Validate required fields
    if (!ktmFile || !userId || !ukmName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Upload KTM to Cloudinary
    const ktmUpload = await uploadToCloudinary(ktmFile, 'registrations/ktm');
    if (!ktmUpload.success) {
      throw new Error(ktmUpload.error || 'Failed to upload KTM');
    }

    // Upload Sertifikat if provided
    let sertifikatUpload = null;
    if (sertifikatFile) {
      sertifikatUpload = await uploadToCloudinary(sertifikatFile, 'registrations/sertifikat');
      if (!sertifikatUpload.success) {
        throw new Error(sertifikatUpload.error || 'Failed to upload Sertifikat');
      }
    }

    // Create registration document
    const registration = {
      userId,
      nama,
      email,
      nim,
      fakultas,
      prodi,
      ukmName,
      alasan,
      ktmFile: {
        url: ktmUpload.url,
        public_id: ktmUpload.public_id,
      },
      sertifikatFile: sertifikatUpload ? {
        url: sertifikatUpload.url,
        public_id: sertifikatUpload.public_id,
      } : null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db('ukm_baru');
    await db.collection('registrations').insertOne(registration);

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: {
        ktmUrl: ktmUpload.url,
        sertifikatUrl: sertifikatUpload?.url || null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Gagal memproses pendaftaran'
    }, { status: 500 });
  }
}