import { NextApiRequest, NextApiResponse } from 'next';

import httpProxyMiddleware from 'next-http-proxy-middleware';

export default (req: NextApiRequest, res: NextApiResponse) =>
  process.env.NODE_ENV !== 'production'
    ? httpProxyMiddleware(req, res, {
        target: process.env.NEXT_PUBLIC_API_URL,
        pathRewrite: [
          {
            patternStr: '^/api',
            replaceStr: ''
          }
        ]
      })
    : res.status(404).send(null);
