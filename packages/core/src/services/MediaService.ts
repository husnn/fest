import { Result } from '../Result';

export interface MediaService {
  pipeFrom(
    url: string,
    filename?: string,
    ext?: string
  ): Promise<Result<string>>;

  getSignedImageUploadUrl(
    filename: string,
    filetype: string,
    filesize: number
  ): Promise<
    Result<{
      signedUrl: string;
      url: string;
    }>
  >;
}
