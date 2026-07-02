import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif|webp/;
  const allowedVideo = /mp4|webm|ogg|mov/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  if (allowedImage.test(ext) && mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (allowedVideo.test(ext) && mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image (jpeg, png, gif, webp) and video (mp4, webm, mov) files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter,
});
