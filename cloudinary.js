const cloudinary = require("cloudinary")

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const options = {
  overwrite: true,
};

const uploadPhotoCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, options);
    return result;
  } catch (err) {
    throw err;
  }
};

const deletePhotoCloudinary = async (idFile) => {
  try {
    const result = await cloudinary.uploader.destroy(idFile, options);
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  uploadPhotoCloudinary,
  deletePhotoCloudinary
}