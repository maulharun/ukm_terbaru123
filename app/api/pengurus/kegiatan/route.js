import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let ukm = searchParams.get('ukm');
        if (!ukm) {
            return NextResponse.json({ success: false, message: 'UKM parameter required' });
        }
        ukm = ukm.trim();

        const client = await clientPromise;
        const db = client.db("ukm_baru");

        const query = { ukm: { $regex: `^${ukm}\\s*$`, $options: 'i' } };

        const activities = await db.collection("kegiatan")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            success: true,
            activities: activities.map(act => ({
                _id: act._id?.toString(),
                title: act.title,
                description: act.description,
                date: act.date,
                location: act.location,
                banner: act.banner,
                banner_id: act.banner_id,
                status: act.status,
                createdAt: act.createdAt
            }))
        });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch activities'
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const date = formData.get('date');
        const location = formData.get('location');
        const status = formData.get('status');
        const ukm = formData.get('ukm');
        const banner = formData.get('banner');

        if (!title || !description || !date || !location || !ukm) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        let bannerData = null;
        if (banner) {
            const result = await uploadToCloudinary(banner, 'kegiatan');
            if (!result.success) {
                throw new Error('Failed to upload banner');
            }
            bannerData = {
                url: result.url,
                public_id: result.public_id
            };
        }

        const client = await clientPromise;
        const db = client.db("ukm_baru");

        const activity = {
            title,
            description,
            date: new Date(date),
            location,
            status,
            ukm: ukm.trim(),
            banner: bannerData?.url || null,
            banner_id: bannerData?.public_id || null,
            createdAt: new Date()
        };

        const result = await db.collection("kegiatan").insertOne(activity);

        return NextResponse.json({
            success: true,
            activity: { ...activity, _id: result.insertedId }
        });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to create activity'
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid activity ID'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("ukm_baru");

        const activity = await db.collection("kegiatan").findOne({
            _id: new ObjectId(id)
        });

        if (!activity) {
            return NextResponse.json({
                success: false,
                message: 'Activity not found'
            }, { status: 404 });
        }

        if (activity.banner_id) {
            await cloudinary.uploader.destroy(activity.banner_id);
        }

        await db.collection("kegiatan").deleteOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json({
            success: true,
            message: 'Activity deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete activity'
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();
        const id = formData.get('id');
        const title = formData.get('title');
        const description = formData.get('description');
        const date = formData.get('date');
        const location = formData.get('location');
        const status = formData.get('status');
        const banner = formData.get('banner');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Activity ID is required'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("ukm_baru");

        const updateData = {
            title,
            description,
            date: new Date(date),
            location,
            status,
            updatedAt: new Date()
        };

        if (banner) {
            const oldActivity = await db.collection("kegiatan").findOne({
                _id: new ObjectId(id)
            });

            if (oldActivity?.banner_id) {
                await cloudinary.uploader.destroy(oldActivity.banner_id);
            }

            const result = await uploadToCloudinary(banner, 'kegiatan');
            if (!result.success) {
                throw new Error('Failed to upload banner');
            }

            updateData.banner = result.url;
            updateData.banner_id = result.public_id;
        }

        await db.collection("kegiatan").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return NextResponse.json({
            success: true,
            message: 'Activity updated successfully'
        });
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to update activity'
        }, { status: 500 });
    }
}