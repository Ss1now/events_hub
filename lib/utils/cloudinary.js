import cloudinary from '@/lib/config/cloudinary';

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder name (default: 'events')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file, folder = 'events') {
  try {
    // Check if file is valid
    if (!file || typeof file.arrayBuffer !== 'function') {
      throw new Error('Invalid file object provided');
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
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
  try {
    console.log(`Starting upload of ${files.length} files to Cloudinary...`);
    const uploadPromises = files.map((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.name, 'size:', file.size);
      return uploadToCloudinary(file, folder);
    });
    const results = await Promise.all(uploadPromises);
    console.log('All uploads completed successfully');
    return results;
  } catch (error) {
    console.error('Error in uploadMultipleToCloudinary:', error);
    throw error;
  }
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
