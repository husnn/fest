import './allow_s3_cors';

import { MediaService, Result } from '@fest/core';
import { PutObjectCommand, S3 as S3Client } from '@aws-sdk/client-s3';

import { PassThrough } from 'stream';
import axios from 'axios';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import path from 'path';

export class TokenMediaStore implements MediaService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.TOKEN_MEDIA_S3_URL,
      region: process.env.TOKEN_MEDIA_S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.TOKEN_MEDIA_S3_API_KEY,
        secretAccessKey: process.env.TOKEN_MEDIA_S3_API_SECRET
      }
    });
  }

  getFilePath(filename: string, ext: string) {
    return `${
      process.env.NODE_ENV === 'staging' ? 'staging/' : ''
    }media/original/${filename}${ext}`;
  }

  async pipeFrom(
    url: string,
    filename?: string,
    ext?: string
  ): Promise<Result<string>> {
    const stream = await axios.get(url, {
      responseType: 'stream'
    });

    const passThrough = new PassThrough();

    const contentType = stream.headers['content-type'];
    const extension = ext ? ext : mime.extension(contentType);

    if (!extension) return Result.fail('Could not get file extension.');

    const filePath = this.getFilePath(filename || nanoid(), extension);

    const command = new PutObjectCommand({
      Bucket: process.env.TOKEN_MEDIA_S3_NAME,
      Key: filePath,
      ContentType: contentType,
      ContentLength: Number(stream.headers['content-length']),
      Body: passThrough,
      ACL: 'public-read'
    });

    stream.data.pipe(passThrough);

    try {
      await this.s3.send(command);
      passThrough.end();

      return Result.ok(`${process.env.TOKEN_MEDIA_URL}/${filePath}`);
    } catch (err) {
      console.log(err);
    }

    return Result.fail('Could not pipe YouTube video thumbnail.');
  }

  async getSignedImageUploadUrl(
    filename: string,
    filetype: string,
    filesize: number
  ): Promise<
    Result<{
      signedUrl: string;
      url: string;
    }>
  > {
    let signedUrl: string;

    const ext = path.extname(filename);
    const filePath = this.getFilePath(nanoid(), ext);

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.TOKEN_MEDIA_S3_NAME,
        Key: filePath,
        ContentType: filetype,
        ContentLength: filesize,
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
          url: `${process.env.TOKEN_MEDIA_URL}/${filePath}`
        })
      : Result.fail();
  }
}

export default TokenMediaStore;
