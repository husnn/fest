import GeoIP from 'geoip-lite';
import { NextApiRequest, NextApiResponse } from 'next';
import { isDevelopment } from '../../utils';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (forwarded as string).split(/, /)[0]
    : req.socket.remoteAddress;
  try {
    const loc = GeoIP.lookup(isDevelopment ? '2.96.0.0' : ip);
    res.status(200).json({ country: loc.country, isEurope: !!loc.eu });
  } catch (err) {
    res.status(500).end();
  }
};
