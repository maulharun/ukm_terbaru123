import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ukm = searchParams.get('ukm');

    if (!ukm) {
      return NextResponse.json({
        success: false,
        message: 'UKM parameter required'
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ukm_baru");
    
    const documents = await db.collection("dokumentasi")
      .find({ ukm })
      .sort({ createdAt: -1 })
      .toArray();

    // Format documents with proper file structure
    const formattedDocuments = documents.map(doc => ({
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      kegiatan: doc.kegiatan,
      tahun: doc.tahun,
      ukm: doc.ukm,
      files: doc.files.map(file => ({
        url: file.url,
        public_id: file.public_id,
        type: file.type,
        fileName: file.fileName,
        fileSize: file.fileSize
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    return NextResponse.json({
      success: true,
      documents: formattedDocuments
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

// POST new document
export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const kegiatan = formData.get('kegiatan');
    const tahun = formData.get('tahun');
    const ukm = formData.get('ukm');
    const files = formData.getAll('files');

    if (!files.length || !title || !ukm) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Upload files to Cloudinary
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file, 'dokumentasi');
        if (!result.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return {
          url: result.url,
          public_id: result.public_id,
          type: file.type.split('/')[0],
          fileName: file.name,
          fileSize: file.size
        };
      })
    );

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db("ukm_baru");
    
    const doc = {
      title,
      description,
      kegiatan,
      tahun: parseInt(tahun),
      ukm,
      files: uploadedFiles,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("dokumentasi").insertOne(doc);

    return NextResponse.json({
      success: true,
      documentId: result.insertedId,
      message: 'Files uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false, 
      message: error.message || 'Failed to upload files'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
          return NextResponse.json({
              success: false,
              message: 'Document ID required'
          }, { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("ukm_baru");

      // Get document to delete Cloudinary files
      const document = await db.collection("dokumentasi").findOne({
          _id: new ObjectId(id)
      });

      if (!document) {
          return NextResponse.json({
              success: false,
              message: 'Document not found'
          }, { status: 404 });
      }

      // Delete files from Cloudinary
      await Promise.all(
          document.files.map(file => 
              cloudinary.uploader.destroy(file.public_id)
          )
      );

      // Delete document from MongoDB
      await db.collection("dokumentasi").deleteOne({
          _id: new ObjectId(id)
      });

      return NextResponse.json({
          success: true,
          message: 'Document and files deleted successfully'
      });

  } catch (error) {
      console.error('Delete error:', error);
      return NextResponse.json({
          success: false,
          message: error.message || 'Failed to delete document'
      }, { status: 500 });
  }
}