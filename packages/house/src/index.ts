import {
  Channel,
  JoinChannelData,
  LeaveChannelData,
  MessageDTO,
  SendMessageData
} from '@fanbase/shared';
import Postgres, { UserRepository } from '@fanbase/postgres';
import { Server, Socket } from 'socket.io';
import { User, verifyCommunityToken } from '@fanbase/core';

import { createServer } from 'http';
import { postgresConfig } from './config';
import redis from 'redis';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

type UserInfo = {
  id: string;
  name: string;
};

const users = new Map<string, UserInfo>();

let userRepository: UserRepository;

Postgres.init(postgresConfig).then(() => {
  userRepository = new UserRepository();
  io.use(authMiddleware);
});

const authMiddleware = async (socket: Socket, next) => {
  const { token } = socket.handshake.query || {};
  if (token) {
    try {
      const { userId } = User.fromJwt(token as string) || {};
      if (!userId) throw new Error();

      if (!users.has(userId)) {
        const user = await userRepository.get(userId);

        users.set(socket.id, {
          id: userId,
          name: user.name || user.username || user.id
        });
      }
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  }

  next();
};

const getChannelKey = ({ communityId, roomId }: Channel): string => {
  return `${communityId}${roomId ? `#${roomId}` : ''}`;
};

const redisSub = redis.createClient(process.env.REDIS_URL);
const redisPub = redis.createClient(process.env.REDIS_URL);

redisSub.subscribe('universal');

const updateOnlineCount = (
  channelKey: string,
  userId: string,
  isAdd: boolean
) => {
  const key = `chat:online:${channelKey}`;

  if (isAdd) redisPub.sadd(key, userId);
  else redisPub.srem(key, userId);

  redisPub.scard(key, (err, count) => {
    if (!err) io.to(channelKey).emit(`online count`, count);
  });
};

io.on('connection', (socket) => {
  socket.on('join', ({ communityId, roomId, token }: JoinChannelData) => {
    if (!token) return;

    const { communityId: cIdRecovered } = verifyCommunityToken(token) || {};
    if (cIdRecovered !== communityId) return;

    const channelKey = getChannelKey({ communityId, roomId });
    if (socket.rooms.has(channelKey)) return;

    socket.join(channelKey);

    const userId = users.get(socket.id).id;
    updateOnlineCount(channelKey, userId, true);

    console.log(`User ${userId} joined channel ${channelKey}`);
  });

  socket.on('leave', ({ communityId, roomId }: LeaveChannelData) => {
    const channelKey = getChannelKey({ communityId, roomId });
    socket.leave(channelKey);

    const userId = users.get(socket.id).id;
    updateOnlineCount(channelKey, userId, false);

    console.log(`User ${userId} left the channel ${channelKey}`);
  });

  socket.on<'sendMessage'>(
    'sendMessage',
    (message: MessageDTO, { communityId, roomId }: SendMessageData) => {
      const channelKey = getChannelKey({ communityId, roomId });
      if (!socket.rooms.has(channelKey)) return;

      redisPub.publish('universal', JSON.stringify(message));
    }
  );
});

redisSub.on('message', (_: string, message: string) => {
  const messageDTO: MessageDTO = JSON.parse(message);
  const { communityId, roomId } = messageDTO;
  io.to(getChannelKey({ communityId, roomId })).emit('newMessage', messageDTO);
});

httpServer.listen(process.env.PORT || 3070, () => {
  console.log('App running.');
});
