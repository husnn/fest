import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { nanoid } from 'nanoid';
import path from 'path';

const s3 = new aws.S3({
  region: process.env.MEDIA_S3_REGION || 'us-east-1'
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.MEDIA_S3_NAME,
    cacheControl: 'max-age=604800', // 7 days
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(
        null,
        `users/${req.user}/${nanoid(32)}${path.extname(file.originalname)}`
      );
    }
  }),
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Unsupported image type'));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
