const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50) * 1024 * 1024;

const ALLOWED_MIMETYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype) || file.mimetype === 'application/octet-stream';
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (extOk) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel (.xlsx) files are allowed.'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
