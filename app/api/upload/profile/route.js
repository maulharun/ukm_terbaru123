import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded'
      }, { status: 400 });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, 'profiles');

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to upload image'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Profile Upload Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    }, { status: 500 });
  }
}