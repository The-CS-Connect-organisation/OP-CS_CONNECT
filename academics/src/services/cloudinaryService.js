/**
 * Cloudinary Upload Service
 * Handles image uploads to Cloudinary for student achievements
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export const cloudinaryService = {
  /**
   * Upload an image file to Cloudinary
   * @param {File} file - The file to upload
   * @param {string} folder - Optional folder name (default: 'sms_achievements')
   * @returns {Promise<string>} - The secure URL of the uploaded image
   */
  async uploadImage(file, folder = 'sms_achievements') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('[Cloudinary] Upload error:', error);
      throw error;
    }
  },

  /**
   * Convert a data URL to a File object for upload
   * @param {string} dataUrl - The data URL of the image
   * @param {string} filename - The filename for the file
   * @returns {File}
   */
  dataUrlToFile(dataUrl, filename = 'image.jpg') {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  },

  /**
   * Validate if a file is an acceptable image type
   * @param {File} file
   * @returns {boolean}
   */
  isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * Get a placeholder image URL for when upload is unavailable
   * @returns {string}
   */
  getPlaceholder() {
    return `https://picsum.photos/seed/${Date.now()}/400/300`;
  },
};

export default cloudinaryService;