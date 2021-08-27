// import './allow_s3_cors';

import { nanoid } from 'nanoid';
import path from 'path';

import { PutObjectCommand, S3 as S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Result } from '@fanbase/core';

export class TokenMediaStore {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.S3_TOKEN_MEDIA_URL,
      region: process.env.S3_TOKEN_MEDIA_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_TOKEN_MEDIA_API_KEY,
        secretAccessKey: process.env.S3_TOKEN_MEDIA_API_SECRET
      }
    });
  }

  async getImageUploadUrl(
    filename: string,
    filetype: string
  ): Promise<
    Result<{
      signedUrl: string;
      url: string;
    }>
  > {
    let signedUrl;

    const ext = path.extname(filename);
    const filePath = `media/full/${nanoid()}${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_TOKEN_MEDIA_NAME,
        Key: filePath,
        ContentType: filetype,
        ACL: 'public-read'
      });

      signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 300
      });
    } catch (err) {
      console.log(err);
    }

    return signedUrl
      ? Result.ok({
          signedUrl,
          url: `${process.env.S3_TOKEN_MEDIA_URL}/${process.env.S3_TOKEN_MEDIA_NAME}/${filePath}`
        })
      : Result.fail();
  }
}

export default TokenMediaStore;
