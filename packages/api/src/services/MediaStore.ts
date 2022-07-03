import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3 as S3Client
} from '@aws-sdk/client-s3';

import { MediaService } from '@fest/core';
import { PassThrough } from 'stream';
import { Result } from '@fest/shared';
import axios from 'axios';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import path from 'path';

export class MediaStore implements MediaService {
  s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      ...(process.env.ECS_CONTAINER_METADATA_URI_V4 && {
        credentials: fromContainerMetadata()
      }),
      region: process.env.MEDIA_S3_REGION || 'us-east-1'
    });
  }

  getKeyFromUrl(url: string, basePath?: string): string {
    let parts = url.split(process.env.MEDIA_S3_URL);
    if (parts.length < 2) return null;
    if (basePath) parts = parts[1].split(`/${basePath}`);
    return parts.length < 2 ? null : parts[1].substring(1);
  }

  async pipeFrom(
    basePath: string,
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

    const filePath = `${basePath}/${filename || nanoid(32)}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.MEDIA_S3_NAME,
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

      return Result.ok(`${process.env.MEDIA_S3_URL}/${filePath}`);
    } catch (err) {
      console.log(err);
    }

    return Result.fail('Could not pipe media.');
  }

  async getSignedImageUploadUrl(
    basePath: string,
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
    const filePath = `${basePath}/${nanoid(32)}${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.MEDIA_S3_NAME,
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
          url: `${process.env.MEDIA_S3_URL}/${filePath}`
        })
      : Result.fail();
  }

  async deleteFile(key: string): Promise<Result> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.MEDIA_S3_NAME,
          Key: key
        })
      );

      return Result.ok();
    } catch (err) {
      console.log(err);
    }

    return Result.fail();
  }
}

export default MediaStore;
