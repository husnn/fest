import net from 'net';

import { serverConfig } from './config';

export const createServer = () => {
  const { host, port } = serverConfig;

  const server = net.createServer();

  server.listen(port, host, () => {
    console.log(`Indexer running at ${host}:${port}`);
  });

  const sockets = [];

  server.on('connection', function (sock) {
    sockets.push(sock);
    console.log(`New connection from ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', function (data: string) {
      if (data == 'health') sock.write(`Online`);
    });

    sock.on('error', (err: string) => {
      console.log(`Error getting client. ${err}`);
    });

    sock.on('close', () => {
      const index = sockets.findIndex((o) => {
        return (
          o.remoteAddress === sock.remoteAddress &&
          o.remotePort === sock.remotePort
        );
      });
      if (index !== -1) sockets.splice(index, 1);
      console.log(
        `Closed connection with ${sock.remoteAddress}:${sock.remotePort}`
      );
    });
  });
};
