import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_TOKEN_MEDIA_URL,
  region: process.env.S3_TOKEN_MEDIA_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_TOKEN_MEDIA_API_KEY,
    secretAccessKey: process.env.S3_TOKEN_MEDIA_API_SECRET
  }
});

const config = {
  AllowedHeaders: ['*'],
  AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'POST', 'DELETE'],
  AllowedOrigins: ['*'],
  MaxAgeSeconds: 3000,
  ExposeHeaders: []
};

const corsParams = {
  Bucket: process.env.S3_TOKEN_MEDIA_NAME,
  CORSConfiguration: { CORSRules: [config] }
};

s3.send(new PutBucketCorsCommand(corsParams));
