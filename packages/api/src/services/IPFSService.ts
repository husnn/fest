import { IPFSService as IIPFSService, PinData } from '@fest/core';
import { IPFSHTTPClient, create } from 'ipfs-http-client';
import { Result, WrappedError } from '@fest/shared';

import axios from 'axios';

export class IPFSService implements IIPFSService {
  private ipfs: IPFSHTTPClient;

  constructor(infuraProjectId, infuraProjectSecret) {
    this.ipfs = create({
      host: 'ipfs.infura.io',
      protocol: 'https',
      port: 5001,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${infuraProjectId}:${infuraProjectSecret}`
        ).toString('base64')}`
      }
    });
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

      const pin = await this.ipfs.add(stream.data);

      return Result.ok({
        hash: pin.cid.toString(),
        uri: this.getUri(pin.cid.toString())
      });
    } catch (err) {
      return Result.fail(
        new WrappedError(err, 'Could not pipe token media to IPFS.')
      );
    }
  }

  async saveJson(content): Promise<Result<PinData>> {
    try {
      const pin = await this.ipfs.add(JSON.stringify(content));

      return Result.ok({
        hash: pin.cid.toString(),
        uri: this.getUri(pin.cid.toString())
      });
    } catch (err) {
      console.log(err);
    }

    return Result.fail();
  }
}

export default IPFSService;
