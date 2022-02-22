/** @jsxImportSource @emotion/react */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Button } from '../ui';

const Header = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 30px 10px;
  font-size: 35pt;
`;

const Heading = styled.h1`
  margin-top: 80px;
  font-size: 40pt;
  text-align: center;
  font-weight: 800;
  color: #f5f5f5;

  @media screen and (max-width: 500px) {
    font-size: 30pt;
  }
`;

const Main = styled.div`
  height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;

  > * + * {
    margin-top: 20px;
  }
`;

const CoinScroller = styled.div`
  width: 100%;
  height: 100px;
  background: url('/images/ill-pixel-coin.png') repeat-x;
  background-size: 100px;
  animation: coin-scroll 500000s linear infinite;

  @keyframes coin-scroll {
    0% {
      background-position: 0 0;
    }

    100% {
      background-position: 10000000px 0;
    }
  }
`;

const VideoSection = styled.div`
  width: 100vw;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const FullWidthVideo = styled.video`
  width: 100%;

  @media screen and (max-width: 500px) {
    width: 700px;
  }

  @media screen and (max-width: 800px) {
    width: 1000px;
  }
`;

const VideoContent = styled.div`
  width: 80%;
  max-width: 600px;
  position: absolute;
  color: #ffffff;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 30pt;
  font-family: 'Press Start 2P';
`;

const Description = styled.p`
  margin-top: 20px;
  font-size: 18pt;
  font-weight: 100;
  letter-spacing: 0.1em;

  @media screen and (max-width: 600px) {
    font-size: 16pt;
  }
`;

const HomePageV1 = () => {
  return (
    <div
      className="container"
      css={css`
        padding: 0;
        top: 0;
        background-color: #000411;
      `}
    >
      <Header>🎉</Header>
      <Main>
        <Heading>
          Build your own NFT-backed
          <br />
          community{' '}
          <span
            css={css`
              position: absolute;
              margin: -25px 0 0 5px;
              font-size: 1.5em;
            `}
          >
            ✌️
          </span>
        </Heading>
        <Button color="primary">Get early access</Button>
      </Main>
      <CoinScroller />
      <VideoSection>
        <FullWidthVideo muted loop id="myVideo" autoPlay>
          <source src="/videos/vid-neon-rectangle-1.webm" type="video/webm" />
        </FullWidthVideo>
        <VideoContent>
          <Title>What is Fest?</Title>
          <Description>
            Fest is a platform that allows creators to create exclusive
            communities for their fans, backed by NFTs.
          </Description>
        </VideoContent>
      </VideoSection>
    </div>
  );
};

export default HomePageV1;
