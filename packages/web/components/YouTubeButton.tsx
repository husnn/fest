import Button from '../ui/Button';
import React from 'react';
import useGoogleAuth from '../modules/youtube/useGoogleAuth';

type YouTubeButtonProps = {
  linked?: boolean;
  onLinkReceived?: (link: string) => void;
};

export const YouTubeButton: React.FC<YouTubeButtonProps> = ({
  onLinkReceived
}: YouTubeButtonProps) => {
  const { isLinked, getLink, unlink } = useGoogleAuth();

  return (
    <Button
      size="small"
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={async () => {
        if (!isLinked) {
          const link = await getLink();
          onLinkReceived ? onLinkReceived(link) : null;
        } else {
          unlink();
        }
      }}
    >
      <img
        src="/images/ic-youtube-circle.png"
        width={20}
        style={{ marginRight: 10 }}
      />
      {isLinked ? 'Unlink channel' : 'Sign in with YouTube'}
    </Button>
  );
};
