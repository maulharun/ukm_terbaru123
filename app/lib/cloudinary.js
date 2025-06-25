import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'ukm') => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(fileBuffer);

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          public_id: `${folder}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      uploadStream.end(bytes);
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get assets from Cloudinary
export const getCloudinaryAssets = async (folder = 'ukm') => {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    return {
      success: true,
      assets: result.resources.map(resource => ({
        id: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        created_at: resource.created_at,
        folder: resource.folder
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete asset from Cloudinary
export const deleteCloudinaryAsset = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      success: result.result === 'ok',
      result: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Search assets in Cloudinary
export const searchCloudinaryAssets = async (query, folder = 'ukm') => {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/* AND ${query}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    return {
      success: true,
      assets: result.resources
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};