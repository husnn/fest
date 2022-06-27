import { ApiClient } from '../modules/api';
import Button from '../ui/Button';
import React from 'react';
import useDiscordAuth from '../modules/discord/useDiscordAuth';

type DiscordButtonProps = {
  linked?: boolean;
  onLinkReceived?: (link: string) => void;
};

export const DiscordButton: React.FC<DiscordButtonProps> = ({
  onLinkReceived
}: DiscordButtonProps) => {
  const { isLinked, unlink } = useDiscordAuth();

  return (
    <Button
      size="small"
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={async () => {
        if (!isLinked) {
          ApiClient.getInstance()
            .getDiscordLink()
            .then((link) => (onLinkReceived ? onLinkReceived(link) : null));
        } else {
          unlink();
        }
      }}
    >
      <img
        src="/images/ic-discord-circle.png"
        width={20}
        style={{ marginRight: 10 }}
      />
      {isLinked ? 'Unlink account' : 'Sign in with Discord'}
    </Button>
  );
};
