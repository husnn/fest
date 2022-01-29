import { IPFSService, PinData } from '../../services';
import { TokenMetadata, TokenType } from '@fest/shared';

import Result from '../../Result';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';

export const pinToIPFS = async (
  repo: TokenRepository,
  ipfs: IPFSService,
  token: Token
): Promise<Result<PinData>> => {
  let modified = false;

  if (!token.mediaUri) {
    const pinResult = await ipfs.pipeFrom(token.image);
    if (!pinResult.success) return Result.fail('Could not pipe image to IPFS.');

    token.mediaUri = pinResult.data.uri;
    modified = true;
  }

  let metadataPinResult: Result<PinData>;

  if (!token.metadataUri) {
    const { type, name, description, mediaUri, externalUrl, attributes } =
      token;

    const metadata: TokenMetadata = {
      type,
      name,
      description,
      image: mediaUri,
      attributes
    };

    if (type === TokenType.YT_VIDEO) {
      metadata.youtube_url = externalUrl;
    } else {
      metadata.external_url = externalUrl;
    }

    metadataPinResult = await ipfs.saveJson(metadata);
    if (!metadataPinResult.success)
      return Result.fail('Could not pin token metadata to IPFS.');

    token.metadataUri = metadataPinResult.data.uri;
    modified = true;
  }

  if (modified) {
    try {
      await repo.update(token);
    } catch (err) {
      console.log(err);
      return Result.fail('Could not save token to database.');
    }
  }

  if (!metadataPinResult) {
    metadataPinResult = Result.ok({
      hash: ipfs.extractHash(token.metadataUri),
      uri: token.metadataUri
    });
  }

  return metadataPinResult;
};
