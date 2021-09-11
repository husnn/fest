import { IPFSService, Result } from '@fanbase/core';
import PinataSDK, { PinataClient } from '@pinata/sdk';

export class MetadataStore implements IPFSService {
  private pinata: PinataClient;

  constructor(apiKey, apiKeySecret) {
    this.pinata = PinataSDK(apiKey, apiKeySecret);
  }

  async saveJson(content): Promise<Result<string>> {
    try {
      const pin = await this.pinata.pinJSONToIPFS(content, {});
      return Result.ok(pin.IpfsHash);
    } catch (err) {
      console.log(err);
    }

    return Result.fail();
  }
}

export default MetadataStore;
