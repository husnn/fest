import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

import { appConfig } from '../config';

const s3 = new S3Client({
  endpoint: process.env.TOKEN_MEDIA_S3_URL,
  region: process.env.TOKEN_MEDIA_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.TOKEN_MEDIA_S3_API_KEY,
    secretAccessKey: process.env.TOKEN_MEDIA_S3_API_SECRET
  }
});

const config = {
  AllowedHeaders: ['*'],
  AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST'],
  AllowedOrigins: [appConfig.clientUrl],
  MaxAgeSeconds: 3000,
  ExposeHeaders: []
};

const corsParams = {
  Bucket: process.env.TOKEN_MEDIA_S3_NAME,
  CORSConfiguration: { CORSRules: [config] }
};

s3.send(new PutBucketCorsCommand(corsParams));
