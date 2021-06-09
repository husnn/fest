import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { Request, Response } from '@fanbase/shared';

import { getAuthToken } from '../auth/authStorage';
import HttpClient from './HttpClient';

export default class AxiosClient extends HttpClient {
  private axios: AxiosInstance;

  constructor() {
    super();
    this.axios = axios.create({
      baseURL:
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_API_URL
          : '/api'
    });
  }

  async request<U extends Response | null = Response>(
    req: Request
  ): Promise<U> {
    return this.axios
      .request({
        method: req.method,
        url: req.endpoint,
        data: req.method === 'POST' || 'PUT' ? req.body : null,
        params: req.params,
        headers: {
          ...req.headers,
          ...(req.authentication !== 'none' && {
            Authorization: 'Bearer ' + getAuthToken()
          })
        }
      })
      .then((response: AxiosResponse<U>) => {
        return Promise.resolve(response.data);
      })
      .catch((err: AxiosError<U>) => {
        return Promise.reject(err.response.data);
      });
  }
}
