import { Result } from '../Result';

export abstract class MediaService {
  static basePath = {
    tokens: 'tokens/full',
    posts: 'posts/full'
  };

  abstract getKeyFromUrl(url: string, basePath?: string): string;

  abstract pipeFrom(
    basePath: string,
    url: string,
    filename?: string,
    ext?: string
  ): Promise<Result<string>>;

  abstract getSignedImageUploadUrl(
    basePath: string,
    filename: string,
    filetype: string,
    filesize: number
  ): Promise<
    Result<{
      signedUrl: string;
      url: string;
    }>
  >;

  abstract deleteFile(key: string): Promise<Result>;
}
