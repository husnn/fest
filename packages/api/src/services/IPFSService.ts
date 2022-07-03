import { IPFSService as IIPFSService, PinData } from '@fest/core';
import PinataSDK, { PinataClient } from '@pinata/sdk';

import { Result } from '@fest/shared';
import axios from 'axios';

export class IPFSService implements IIPFSService {
  private pinata: PinataClient;

  constructor(apiKey, apiKeySecret) {
    this.pinata = PinataSDK(apiKey, apiKeySecret);
  }

  extractHash(url: string): string {
    return url.replace('ipfs://', '');
  }

  getUri(hash: string): string {
    return `ipfs://${hash}`;
  }

  async pipeFrom(url: string): Promise<Result<PinData>> {
    try {
      const stream = await axios.get(url, {
        responseType: 'stream'
      });

      const pin = await this.pinata.pinFileToIPFS(stream.data);
      return Result.ok({
        hash: pin.IpfsHash,
        uri: this.getUri(pin.IpfsHash)
      });
    } catch (err) {
      console.log(err);
    }

    return Result.fail('Could not pipe token media to IPFS.');
  }

  async saveJson(content): Promise<Result<PinData>> {
    try {
      const pin = await this.pinata.pinJSONToIPFS(content, {});
      return Result.ok({
        hash: pin.IpfsHash,
        uri: this.getUri(pin.IpfsHash)
      });
    } catch (err) {
      console.log(err);
    }

    return Result.fail();
  }
}

export default IPFSService;
