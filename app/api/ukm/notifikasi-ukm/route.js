import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ukmName = searchParams.get('ukm');

    // Validate UKM name
    if (!ukmName) {
      return NextResponse.json(
        { success: false, message: 'Nama UKM diperlukan' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ukm_baru');

    // Query notifications
    const notifications = await db
      .collection('notif-ukm')
      .find({ 
        ukmName: ukmName 
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Format response
    const formattedNotifications = notifications.map(notif => ({
      _id: notif._id.toString(),
      ukmName: notif.ukmName,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      isRead: Boolean(notif.isRead),
      createdAt: notif.createdAt,
      userId: notif.userId,
      userDetails: notif.userDetails ? {
        nama: notif.userDetails.nama,
        nim: notif.userDetails.nim,
        fakultas: notif.userDetails.fakultas,
        prodi: notif.userDetails.prodi
      } : null
    }));

    // Count unread
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { notificationId } = await request.json();
    
    // Validate notification ID
    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'ID Notifikasi diperlukan' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ukm_baru');

    // Update notification status
    const result = await db.collection('notif-ukm').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, message: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notifikasi telah dibaca'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui notifikasi' },
      { status: 500 }
    );
  }
}