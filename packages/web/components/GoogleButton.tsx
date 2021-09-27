import Button from '../ui/Button';
import React from 'react';
import useGoogleAuth from '../modules/youtube/useGoogleAuth';

type GoogleButtonProps = {
  linked?: boolean;
  onLinkReceived?: (link: string) => void;
};

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onLinkReceived
}: GoogleButtonProps) => {
  const { isLinked, getLink, unlink } = useGoogleAuth();

  return (
    <Button
      size="small"
      color={isLinked ? 'normal' : 'secondary'}
      onClick={async () => {
        if (!isLinked) {
          const link = await getLink();
          onLinkReceived ? onLinkReceived(link) : null;
        } else {
          unlink();
        }
      }}
    >
      {isLinked ? 'Unlink Channel' : 'Link with Google'}
    </Button>
  );
};
