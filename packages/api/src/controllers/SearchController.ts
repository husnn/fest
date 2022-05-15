import { Search } from '@fest/core';
import { UserRepository } from '@fest/postgres';
import { SearchResponse, SearchResultDTO } from '@fest/shared';
import { NextFunction, Request, Response } from 'express';
import { HttpError, HttpResponse } from '../http';

export class SearchController {
  private searchUseCase: Search;

  constructor(userRepository: UserRepository) {
    this.searchUseCase = new Search(userRepository);
  }

  async search(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<SearchResponse>> {
    try {
      const { query } = req.query;
      const { count, page } = req.pagination;

      const result = await this.searchUseCase.exec({
        keyword: query as string,
        count,
        page
      });
      if (!result.success) throw new HttpError(result.error);

      return new HttpResponse<SearchResponse>(
        res,
        {
          body: [new SearchResultDTO({ users: result.data.users })]
        },
        { count, page, total: result.data.total }
      );
    } catch (err) {
      next(err);
    }
  }
}

export default SearchController;
