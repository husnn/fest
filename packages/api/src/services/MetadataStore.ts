import { IPFSService, Result } from '@fest/core';
import PinataSDK, { PinataClient } from '@pinata/sdk';

export class MetadataStore implements IPFSService {
  private pinata: PinataClient;

  constructor(apiKey, apiKeySecret) {
    this.pinata = PinataSDK(apiKey, apiKeySecret);
  }

  async saveJson(content): Promise<Result<string>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return Result.ok('dev-ipfs-hash');
      }

      const pin = await this.pinata.pinJSONToIPFS(content, {});
      return Result.ok(pin.IpfsHash);
    } catch (err) {
      console.log(err);
    }

    return Result.fail();
  }
}

export default MetadataStore;
