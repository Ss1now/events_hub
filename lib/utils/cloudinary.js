import cloudinary from '@/lib/config/cloudinary';

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder name (default: 'events')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file, folder = 'events') {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - The Cloudinary URL to delete
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(imageUrl) {
  try {
    // Extract public_id from URL
    // Example: https://res.cloudinary.com/dqow2tssw/image/upload/v1234567890/events/abc123.jpg
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0]; // abc123
    const folder = parts[parts.length - 2]; // events
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failure shouldn't block the main operation
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export async function uploadMultipleToCloudinary(files, folder = 'events') {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary URLs
 * @returns {Promise<void>}
 */
export async function deleteMultipleFromCloudinary(imageUrls) {
  const deletePromises = imageUrls.map(url => deleteFromCloudinary(url));
  await Promise.all(deletePromises);
}
