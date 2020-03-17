const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const tempy = require('tempy');

const { createWriteStream } = fs;
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const saveTempFile = stream => {
  const filePath = tempy.file({ extension: 'png' });
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(filePath))
      .on('finish', () => resolve(filePath))
      .on('error', reject)
  );
};

/**
 *
 * @param {string} filePath - The image file path
 * @param {string} folder - On which folder It should save on cloudinary
 * @param {string} type - Which type of image this is. Example: profile, cover, session
 */
const uploadToCloudinary = (filePath, folder, type) => {
  return new Promise((resolve, reject) => {
    // TODO: use cloudinary upload_stream to reduce the code further
    cloudinary.uploader.upload(
      filePath,
      {
        tags: 'basic_sample',
        folder,
        public_id: type,
      },
      (err, image) => {
        if (err) reject(err);
        return resolve(image);
      }
    );
  });
};

/**
 *
 * @param {string} imagePromise - The image promise coming from frontend
 */
const uploadImage = async (imagePromise, ...args) => {
  const { stream } = await imagePromise;
  const filePath = await saveTempFile(stream);
  const image = await uploadToCloudinary(filePath, ...args);

  // TODO: quickfix to make sure the returned data is always https
  image.url = image.secure_url;

  fs.unlinkSync(filePath);
  return image;
};

module.exports = { saveTempFile, uploadToCloudinary, uploadImage, cloudinary };
