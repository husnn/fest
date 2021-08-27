// import './allow_s3_cors';

import { nanoid } from 'nanoid';
import path from 'path';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Result } from '@fanbase/core';

export class TokenMediaStore {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.S3_TOKEN_MEDIA_URL,
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
    const ext = path.extname(filename);
    const filePath = `media/full/${nanoid()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_TOKEN_MEDIA_NAME,
      Key: filePath,
      ContentType: filetype,
      ACL: 'public-read'
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 30 });

    return Result.ok({
      signedUrl,
      url: `${process.env.S3_TOKEN_MEDIA_URL}/${process.env.S3_TOKEN_MEDIA_NAME}/${filePath}`
    });
  }
}

export default TokenMediaStore;
