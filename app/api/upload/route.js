import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'ukm';

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: 'File tidak ditemukan atau kosong' },
        { status: 400 }
      );
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Format file harus JPG, PNG atau PDF' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, folder);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Gagal upload ke Cloudinary' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File berhasil diunggah',
      url: result.url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { message: 'Gagal mengunggah file', error: error.message },
      { status: 500 }
    );
  }
}