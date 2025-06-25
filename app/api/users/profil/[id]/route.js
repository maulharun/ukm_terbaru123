import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request, context) {
  try {
    const params = await context.params;
    if (!params?.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({
        success: false,
        message: 'Parameter ID tidak valid'
      }, { status: 400 });
    }

    const { id } = params;
    const client = await clientPromise;
    const db = client.db('ukm_baru');

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          ukm: 1,
          photoUrl: 1,
          nim: 1,          // Added
          prodi: 1,        // Added
          fakultas: 1      // Added
        }
      }
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 404 });
    }

    // Format user data with all fields
    const formattedUser = {
      ...user,
      _id: user._id.toString(),
      nim: user.nim || '',
      prodi: user.prodi || '',
      fakultas: user.fakultas || '',
      ukm: user.ukm?.map(ukm => ({
        ...ukm,
        joinDate: ukm.joinDate ? new Date(ukm.joinDate).toISOString() : null,
        createdAt: ukm.createdAt ? new Date(ukm.createdAt).toISOString() : null,
        updatedAt: ukm.updatedAt ? new Date(ukm.updatedAt).toISOString() : null,
        photoUrl: ukm.photoUrl || ""
      })) || []
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('GET User Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data user',
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Parameter ID tidak ditemukan' },
        { status: 400 }
      );
    }

    const { id } = params;
    const formData = await request.formData();
    const client = await clientPromise;
    const db = client.db("ukm_baru");

    const existingUser = await db.collection('users').findOne(
      { _id: new ObjectId(id) }
    );

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Extract form data
    const name = formData.get('name');
    const email = formData.get('email');
    const nim = formData.get('nim');
    const fakultas = formData.get('fakultas');
    const prodi = formData.get('prodi');
    const file = formData.get('file');

    // Create update object with new structure
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      role: existingUser.role || 'mahasiswa',
      ukm: existingUser.ukm?.map(ukm => ({
        ...ukm,
        nim: nim || ukm.nim,
        fakultas: fakultas || ukm.fakultas,
        prodi: prodi || ukm.prodi,
      })) || [],
      updatedAt: new Date()
    };

    // Handle photo upload if exists
    if (file) {
      if (existingUser.photoUrl) {
        await cloudinary.uploader.destroy(existingUser.public_id);
      }
      const result = await uploadToCloudinary(file, 'profiles');
      if (result.success) {
        updateData.photoUrl = result.url;
        updateData.public_id = result.public_id;
      }
    }

    // Update database
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diubah',
      photoUrl: updateData.photoUrl || null,
      public_id: updateData.public_id || null
    });

  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui profil', error: error.message },
      { status: 500 }
    );
  }
}

// Keep existing GET and DELETE handlers but update DELETE to handle Cloudinary cleanup
export async function DELETE(request, { params }) {
  try {
    const { id } = await Promise.resolve(params);

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Parameter ID tidak ditemukan'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ukm_baru');

    // Get user to delete image
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });

    if (user?.public_id) {
      await cloudinary.uploader.destroy(user.public_id);
    }

    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus user',
      error: error.message
    }, { status: 500 });
  }
}