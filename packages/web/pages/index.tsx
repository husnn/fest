/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Button, Link } from '../ui';
import Head from 'next/head';
import { getCurrentUser } from '../modules/auth/authStorage';
import Router from 'next/router';

const Header = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 50px 20px;
  display: flex;
  position: relative;
  justify-content: space-between;
  z-index: 10;

  > * {
    font-size: 30pt;
  }
`;

const Heading = styled.h1`
  font-size: 40pt;
  text-align: center;
  font-weight: 800;
  color: #f5f5f5;
  z-index: 10;

  > span {
    font-size: inherit;
    font-weight: inherit;
  }

  @media screen and (max-width: 500px) {
    font-size: 30pt;
  }
`;

const Main = styled.div`
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;

  > * + * {
    margin-top: 20px;
  }
`;

const CoinScroller = styled.div`
  width: 100%;
  height: 150px;
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
  margin: 80px 0;
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
  text-align: center;
`;

const SplitSection = styled.div`
  width: 80%;
  display: flex;
  flex-direction: row;
  padding: 30px 0;

  > div {
    width: 100%;
    padding: 50px;

    @media screen and (max-width: 600px) {
      padding: 20px;
    }
  }

  @media screen and (max-width: 800px) {
    flex-direction: column;
    text-align: center;

    div {
      + * * {
        margin-top: 20px;
      }
    }
  }
`;

const Section = styled.div`
  width: 100vw;
  padding: 20px 0 50px;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 25pt;
  font-family: 'Press Start 2P';
  z-index: 10;
`;

const Description = styled.p`
  margin-top: 30px;
  color: #ffffff;
  font-family: 'Courier';
  font-size: 16pt;
  font-weight: 100;
  letter-spacing: 0.1em;

  @media screen and (max-width: 600px) {
    font-size: 14pt;
  }
`;

const FeatureList = styled.ul`
  width: 90%;
  padding: 30px 0;
  color: #fff;
  text-align: center;
  list-style: none;
  z-index: 10;

  li {
    padding: 20px 0;
    font-family: 'Courier';
    font-size: 16pt;

    @media screen and (max-width: 600px) {
      font-size: 14pt;
    }
  }
`;

const FeatureText = styled.p`
  color: #fff;
  font-family: 'Courier';
  font-size: 16pt;

  @media screen and (max-width: 600px) {
    font-size: 14pt;
  }
`;

const GhostButton = styled.button`
  max-height: 50px;
  padding: 15px 30px;
  background: none;
  color: #fff;
  border: 1px solid #fff;
  cursor: pointer;
  transition: color 0.5s;

  &:hover {
    background: #fff;
    color: #000;
  }
`;

const Footer = styled.div`
  width: 100%;
  padding: 50px 0;
  display: flex;
  justify-content: center;
  color: white;
`;

const SocialIcons = styled.div`
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  padding: 10px 20px 5px;
  border-radius: 15px;

  a {
    cursor: pointer;
    opacity: 0.5;

    &:hover {
      opacity: 0.8;
    }
  }

  > * + * {
    margin-left: 20px;
  }
`;

const CircularGradient = styled.div`
  width: 800px;
  height: 800px;
  position: absolute;
  background: radial-gradient(
    circle,
    rgba(143, 0, 255, 1) 0%,
    rgba(0, 0, 0, 0.32) 50%
  );
  opacity: 0.2;
  z-index: 0;
`;

const HomePage = () => {
  useEffect(() => {
    if (getCurrentUser()) Router.push('/home');
  }, []);

  return (
    <div
      className="container"
      css={css`
        padding: 0;
        top: 0;
        background-color: #000411;
        overflow: hidden;
      `}
    >
      <Head>
        <title>Fest</title>
      </Head>
      <Header>
        <div>🎉</div>
        <div>
          <Link
            css={css`
              color: #fff;
            `}
            href="/login"
          >
            Login
          </Link>
        </div>
      </Header>
      <Main>
        <CircularGradient
          css={css`
            background: radial-gradient(
              circle,
              rgba(0, 255, 145, 1) 0%,
              rgba(0, 0, 0, 0.32) 50%
            );
            top: -150px;
            left: 0;
          `}
        />
        <CircularGradient
          css={css`
            right: 0;
          `}
        />
        <Heading
          css={css`
            margin-top: 80px;
          `}
        >
          Build your own{' '}
          <span style={{ whiteSpace: 'nowrap' }}>NFT-backed</span>
          <span style={{ display: 'block', marginLeft: -30 }}>
            community
            <span
              css={css`
                position: absolute;
                margin: -20px 0 0 -5px;
                font-size: 1.3em;
                transform: rotate(10deg);
              `}
            >
              ✌️
            </span>
          </span>
        </Heading>
        <Link
          href="/waitlist"
          css={css`
            z-index: 10;
          `}
        >
          <Button color="primary">Get early access</Button>
        </Link>
        <SocialIcons
          css={css`
            // background-color: #090e1f;
            margin-top: 120px;
          `}
        >
          <Link href="https://discord.gg/dg8E4Vnm6U" target="blank">
            <img src="/images/ic-discord.svg" height={28} />
          </Link>
          <Link href="https://twitter.com/festdao" target="blank">
            <img src="/images/ic-twitter.svg" height={22} />
          </Link>
        </SocialIcons>
      </Main>
      <VideoSection>
        <FullWidthVideo muted loop id="myVideo" autoPlay>
          <source src="/videos/vid-neon-rectangle-1.webm" type="video/webm" />
        </FullWidthVideo>
        <VideoContent>
          <Title>What is Fest?</Title>
          <Description>
            Fest is a platform that allows creators to build exclusive,
            token-gated communities for their fans.
          </Description>
        </VideoContent>
      </VideoSection>
      <Section>
        <Title>Features</Title>
        <SplitSection>
          <Section>
            <img
              style={{ width: '100%' }}
              src={'images/share-content-illustration-1.svg'}
            />
          </Section>
          <Section>
            <FeatureText>
              Share exclusive content with specific token holders.
            </FeatureText>
          </Section>
        </SplitSection>
        <FeatureList>
          <li>Zero-crypto knowledge required</li>
          <li>Turn your YouTube videos in NFTs</li>
          <li>Custodial wallets for users</li>
        </FeatureList>
        <Link
          href="https://www.notion.so/Lightpaper-v0-1-1563dc476d2a422e85addaadcb8c1cda"
          target="blank"
        >
          <GhostButton>Read lightpaper</GhostButton>
        </Link>
      </Section>
      <VideoSection>
        <FullWidthVideo muted loop autoPlay>
          <source src="/videos/vid-neon-triangles-1.webm" type="video/webm" />
        </FullWidthVideo>
      </VideoSection>
      <Section>
        <CircularGradient
          css={css`
            left: 0;
          `}
        />
        <Title>Roadmap</Title>
        <p
          css={css`
            padding: 5px 10px;
            border-radius: 20px;
            opacity: 0.7;
            margin-top: 10px;
            color: black;
            background-color: white;
          `}
        >
          Coming soon
        </p>
        <FeatureList>
          <li>Fest DAO + utility token</li>
          <li>Collection launcher</li>
          <li>AdSense revenue share</li>
          <li>Shopify app</li>
          <li>Event ticketing system</li>
          <li>Creator coins</li>
        </FeatureList>
      </Section>
      <CoinScroller />
      <Section>
        <Title>Connect with your top fans</Title>
        <div
          css={css`
            width: 600px;
            margin-top: 30px;
            background-color: #090e1f;
            padding: 30px;
            border-radius: 30px;

            @media screen and (max-width: 800px) {
              max-width: 80%;
            }
          `}
        >
          <p
            css={css`
              font-family: 'Courier';
              font-size: 16pt;

              @media screen and (max-width: 600px) {
                font-size: 14pt;
              }
            `}
          >
            It&apos;s impossible to connect with everyone, prioritize those who
            love you the most.
          </p>
        </div>
        <Link
          href="/waitlist"
          css={css`
            z-index: 10;
          `}
        >
          <Button
            css={css`
              margin-top: 30px;
            `}
          >
            Apply to beta
          </Button>
        </Link>
      </Section>
      <Footer>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;

            > * + * {
              margin-top: 20px;
            }
          `}
        >
          <p>&copy; {new Date().getFullYear()} Fest</p>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </Footer>
    </div>
  );
};

export default HomePage;
