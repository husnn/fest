import Result from '../Result';

export interface IPFSService {
  saveJson(content): Promise<Result<string>>;
}

export default IPFSService;
