import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ukm_baru");

    const registrations = await db.collection("registrations")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      registrations: registrations.map(reg => ({
        _id: reg._id.toString(),
        userId: reg.userId || '',
        nama: reg.nama || '',
        email: reg.email || '',
        nim: reg.nim || '',
        fakultas: reg.fakultas || '',
        prodi: reg.prodi || '',
        ukmName: reg.ukmName || '',
        alasan: reg.alasan || '',
        ktmFile: {
          url: reg.ktmFile?.url || '',
          public_id: reg.ktmFile?.public_id || ''
        },
        sertifikatFile: {
          url: reg.sertifikatFile?.url || '',
          public_id: reg.sertifikatFile?.public_id || ''
        },
        status: reg.status || 'pending',
        createdAt: reg.createdAt || new Date(),
        updatedAt: reg.updatedAt || new Date()
      }))
    });
  } catch (error) {
    console.error("GET Validasi error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { registrationId, status, alasanPenolakan } = await request.json();

    if (!registrationId || !status) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ukm_baru");
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const registration = await db.collection("registrations").findOne(
          { _id: new ObjectId(registrationId) }
        );

        if (!registration) {
          throw new Error("Registration not found");
        }

        // Update registration status
        const updateResult = await db.collection("registrations").updateOne(
          { _id: new ObjectId(registrationId) },
          {
            $set: {
              status,
              alasanPenolakan: alasanPenolakan || '',
              tanggalDiterima: status === 'approved' ? new Date() : null,
              updatedAt: new Date()
            }
          },
          { session }
        );

        if (!updateResult.modifiedCount) {
          throw new Error("Failed to update registration status");
        }

        // Handle notifications and updates based on status
        if (status === 'approved') {
          await handleApproval(db, registration, session);
        } else {
          await handleRejection(db, registration, alasanPenolakan, session);
        }
      });

      return NextResponse.json({
        success: true,
        message: `Registration ${status} successfully`
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error("PUT Validasi error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update registration status"
    }, { status: 500 });
  }
}

async function handleApproval(db, registration, session) {
  try {
    // Update UKM members
    await db.collection("ukm").updateOne(
      { name: registration.ukmName },
      {
        $push: {
          members: {
            userId: registration.userId,
            nim: registration.nim,
            name: registration.nama,
            prodi: registration.prodi,
            fakultas: registration.fakultas,
            tanggalDiterima: new Date()
          }
        }
      },
      { session }
    );

    // Update user's UKM list
    await db.collection("users").updateOne(
      { _id: new ObjectId(registration.userId) },
      {
        $push: {
          ukm: {
            name: registration.ukmName,
            joinDate: new Date(),
            nim: registration.nim,
            fakultas: registration.fakultas,
            prodi: registration.prodi,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      },
      { session }
    );

    // Create notification for user
    await db.collection("notif-user").insertOne({
      userId: registration.userId,
      title: `Pendaftaran UKM ${registration.ukmName}`,
      message: `Selamat! Anda telah diterima di UKM ${registration.ukmName}`,
      type: 'success',
      isRead: false,
      createdAt: new Date(),
      ukmName: registration.ukmName
    }, { session });

    // Create notification for UKM admin
    await db.collection("notif-ukm").insertOne({
      ukmName: registration.ukmName,
      title: "Anggota Baru",
      message: `${registration.nama} (${registration.nim}) telah bergabung dengan UKM ${registration.ukmName}`,
      type: 'info',
      isRead: false,
      createdAt: new Date(),
      userId: registration.userId,
      userDetails: {
        nama: registration.nama,
        nim: registration.nim,
        fakultas: registration.fakultas,
        prodi: registration.prodi
      }
    }, { session });

  } catch (error) {
    console.error('Handle Approval Error:', error);
    throw error;
  }
}

async function handleRejection(db, registration, alasanPenolakan, session) {
  await db.collection("notif-user").insertOne({
    userId: registration.userId,
    title: `Pendaftaran UKM ${registration.ukmName}`,
    message: `Maaf, pendaftaran Anda di UKM ${registration.ukmName} ditolak. ${alasanPenolakan}`,
    type: 'warning',
    isRead: false,
    createdAt: new Date(),
    ukmName: registration.ukmName,
    alasanPenolakan
  }, { session });
}