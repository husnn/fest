import Result from '../Result';

export type PinData = {
  hash: string;
  uri: string;
};

export interface IPFSService {
  extractHash(url: string): string;
  pipeFrom(url: string): Promise<Result<PinData>>;
  saveJson(content): Promise<Result<PinData>>;
}

export default IPFSService;
