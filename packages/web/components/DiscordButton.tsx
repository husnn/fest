import { ApiClient } from '../modules/api';
import Button from '../ui/Button';
import { CommunityDTO } from '@fest/shared';
import React from 'react';
import useDiscordAuth from '../modules/discord/useDiscordAuth';

type DiscordButtonProps = {
  community?: CommunityDTO;
  onLinkReceived?: (link: string) => void;
};

export const DiscordButton: React.FC<DiscordButtonProps> = ({
  community,
  onLinkReceived
}: DiscordButtonProps) => {
  const { isLinked, unlink } = useDiscordAuth(!community?.discordGuildId);

  return (
    <Button
      size="small"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={async () => {
        if (!isLinked || (community && !community.discordGuildId)) {
          ApiClient.getInstance()
            .getDiscordLink(community?.id)
            .then((link) => (onLinkReceived ? onLinkReceived(link) : null));
        } else {
          unlink();
        }
      }}
      disabled={!!community?.discordGuildId}
    >
      <img
        src="/images/ic-discord-circle.png"
        width={20}
        style={{ marginRight: 10 }}
      />
      {community
        ? community.discordGuildId
          ? `Connected to ${
              community.discordGuildName || community.discordGuildId
            }`
          : 'Link Discord server'
        : isLinked
        ? 'Unlink account'
        : 'Sign in with Discord'}
    </Button>
  );
};
