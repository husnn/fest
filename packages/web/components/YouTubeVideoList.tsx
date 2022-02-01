import moment from 'moment';
import React from 'react';

import styled from '@emotion/styled';
import { YouTubeVideo } from '@fest/shared';

import useYouTubeVideos from '../modules/youtube/useYouTubeVideos';
import styles from '../styles/YouTubeVideoList.module.scss';
import { Button, Link } from '../ui';

type YouTubeVideoRowProps = {
  video: YouTubeVideo;
  selected?: boolean;
  onClick?: (video: YouTubeVideo) => void;
};

const YouTubeVideoRowContainer = styled.div<{
  selected?: boolean;
}>`
  padding: 15px 20px;
  background-color: ${(props) => (props.selected ? '#f5f5f5' : '#fff')};
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  border-bottom: 1px solid #eee;
  border-radius: 20px;
  cursor: pointer;
  box-sizing: padding-box;

  > * + * {
    margin-left: 15px;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const YouTubeVideoRowThumbnail = styled.div`
  img {
    width: 100%;
    border-radius: 10px;
  }
`;

const YouTubeVideoRowDetails = styled.div`
  .yt-video-row__date {
    margin-bottom: 5px;
    font-size: 9pt;
    opacity: 0.5;
  }

  .yt-video-row__title {
    margin: 0 0 10px;
    font-weight: bold;
  }

  .yt-video-row__description {
    max-height: 2rem;
    font-size: 9pt;
    line-height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const formatTimezone = (tz: string) => moment(tz).format('Do MMMM YYYY');

export const YouTubeVideoRow = ({
  video,
  selected,
  onClick
}: YouTubeVideoRowProps) => {
  return (
    <YouTubeVideoRowContainer
      selected={selected}
      onClick={() => (onClick ? onClick(video) : null)}
    >
      <YouTubeVideoRowThumbnail>
        <img src={video.thumbnail} />
      </YouTubeVideoRowThumbnail>
      <YouTubeVideoRowDetails>
        <p className="yt-video-row__date">
          {formatTimezone(video.datePublished)}
        </p>
        <p className="yt-video-row__title">{video.title}</p>
        <p className="yt-video-row__description">{video.description}</p>
      </YouTubeVideoRowDetails>
    </YouTubeVideoRowContainer>
  );
};

type YouTubeVideoListProps = {
  onSelected: (video: YouTubeVideo) => void;
};

const YouTubeVideoList: React.FC<YouTubeVideoListProps> = ({
  onSelected
}: YouTubeVideoListProps) => {
  const { videos, loadVideos, moreAvailable, error } = useYouTubeVideos();

  return !error ? (
    <div className={styles.videoList}>
      <div className="yt-videos">
        {videos?.map((video: YouTubeVideo, index: number) => (
          <YouTubeVideoRow
            key={index}
            video={video}
            onClick={() => {
              onSelected(video);
            }}
          />
        ))}
      </div>
      {moreAvailable && (
        <Button
          style={{ margin: '10px 20px 0', float: 'right' }}
          color="normal"
          size="small"
          onClick={() => {
            loadVideos();
          }}
        >
          Load more
        </Button>
      )}
    </div>
  ) : (
    <div>
      <p>There was a problem getting your videos.</p>
      <p>Is your channel connected?</p>

      <Link href="/settings">
        <Button style={{ margin: '20px 0 0' }} color="normal" size="small">
          Go to settings
        </Button>
      </Link>
    </div>
  );
};

export default YouTubeVideoList;
