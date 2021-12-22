export type Channel = {
  communityId: string;
  roomId?: string;
};

export type JoinChannelData = {
  communityId: string;
  roomId?: string;
  token: string;
};

export type LeaveChannelData = {
  communityId: string;
  roomId: string;
};

export type SendMessageData = {
  communityId: string;
  roomId?: string;
};
