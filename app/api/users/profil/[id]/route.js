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
    // Parse JSON body instead of formData
    const data = await request.json();
    
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

    // Create update object
    const updateData = {
      name: data.name || existingUser.name,
      email: data.email || existingUser.email,
      nim: data.nim || existingUser.nim,
      fakultas: data.fakultas || existingUser.fakultas,
      prodi: data.prodi || existingUser.prodi,
      role: existingUser.role || 'mahasiswa',
      photoUrl: data.photoUrl || existingUser.photoUrl,
      updatedAt: new Date()
    };

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
      user: { ...updateData, _id: id }
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
