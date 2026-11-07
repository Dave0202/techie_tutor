import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'mrnfxyxs';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'virtual-tutor';

export async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
  );
  const imageUrl = response.data?.secure_url;
  if (typeof imageUrl !== 'string' || !imageUrl) {
    throw new Error('Cloudinary did not return a secure image URL.');
  }
  return imageUrl;
}
