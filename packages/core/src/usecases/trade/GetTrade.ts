import UseCase from '../../base/UseCase';
import { Result } from '../../Result';

type GetTradeInput = {
  token: string;
};

type GetTradeOutput = {
  trade: string;
};

export class GetTrade extends UseCase<GetTradeInput, GetTradeOutput> {
  exec(data: GetTradeInput): Promise<Result<GetTradeOutput>> {
    throw new Error('Method not implemented.');
  }
}
