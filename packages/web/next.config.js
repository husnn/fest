/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
// const withTM = require('next-transpile-modules')([
//   '@fest/shared',
//   '@fest/eth-contracts',
//   '@fest/eth-transactions'
// ]);

module.exports = {
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.(png)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]'
          }
        }
      }
    );

    return config;
  },
  transpilePackages: [
    '@fest/shared',
    '@fest/eth-contracts',
    '@fest/eth-transactions'
  ],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  async headers() {
    const headers = [];
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ],
        source: '/:path*'
      });
    }
    return headers;
  }
};
