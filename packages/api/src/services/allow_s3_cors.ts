import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_TOKEN_MEDIA_URL,
  credentials: {
    accessKeyId: process.env.S3_TOKEN_MEDIA_API_KEY,
    secretAccessKey: process.env.S3_TOKEN_MEDIA_API_SECRET
  }
});

const config = {
  AllowedHeaders: ['*'],
  AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST'],
  AllowedOrigins: ['*'],
  MaxAgeSeconds: 3000
};

const corsParams = {
  Bucket: process.env.S3_TOKEN_MEDIA_NAME,
  CORSConfiguration: { CORSRules: [config] }
};

s3.send(new PutBucketCorsCommand(corsParams));
