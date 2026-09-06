const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

exports.uploadFile = (buffer, originalName, userId) => {
  return new Promise((resolve, reject) => {
    const publicId = `dataforge/datasets/${userId}/${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id: publicId, overwrite: false },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
};

exports.uploadBuffer = (buffer, fileName, userId, resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    const publicId = `dataforge/reports/${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: publicId },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
};

exports.deleteFile = (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};
