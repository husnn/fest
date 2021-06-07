import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

export default (req: NextApiRequest, res: NextApiResponse) =>
  process.env.NODE_ENV !== 'production'
    ? httpProxyMiddleware(req, res, {
      target: 'http://localhost:5000',
      pathRewrite: {
        '^/api': '/v1'
      }
    })
    : res.status(404).send(null);
