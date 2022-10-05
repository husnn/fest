/** @jsxImportSource @emotion/react */

import { Button, FeatureCollection, Link } from '../ui';
import React, { useEffect } from 'react';
import { colors, corners } from '../styles/constants';

import Accordion from '../ui/Accordion';
import Head from 'next/head';
import MultiFeatureCard from '../components/MultiFeatureCard';
import { Spacing } from '../ui/Spacing';
import { css } from '@emotion/react';
import { getCurrentUser } from '../modules/auth/authStorage';
import router from 'next/router';
import styled from '@emotion/styled';

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

  @media screen and (max-width: 500px) {
    text-align: left;
    font-size: 30pt;
  }
`;

const Text = styled.p`
  margin-top: 30px;
  color: #2a2a2a;
  font-size: 16pt;
  font-weight: 100;
  letter-spacing: 0.025em;

  @media screen and (max-width: 500px) {
    text-align: left;
    font-size: 14pt;
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

const Section = styled.div`
  width: 100vw;
  padding: 20px 20px 50px;
  margin-bottom: 20px;
  color: ${colors.black};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 10;
`;

const SectionSplit = (props: { children: React.ReactNode[] }) => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(2, minmax(300px, 500px));

        @media screen and (max-width: 800px) {
          grid-template-columns: 1fr;
          > :not(:nth-child(0)) {
            margin-bottom: 30px;
          }
        }
      `}
    >
      {props.children.map((c, i) => (
        <div
          css={css`
            padding: 20px;
          `}
          key={i}
        >
          {c}
        </div>
      ))}
    </div>
  );
};

const HeadingSection = styled.div`
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  > p {
    margin-top: 15px;
  }

  button {
    margin-top: 15px;
    @media screen and (max-width: 500px) {
      /* display: none; */
      align-self: flex-start;
    }
  }
`;

const CircularGradient = styled.div`
  width: 800px;
  height: 500px;
  position: absolute;
  background: linear-gradient(
    90deg,
    rgba(151, 150, 240, 0.5) 0%,
    rgba(251, 199, 212, 0.6) 100%
  );
  filter: blur(200px);
  z-index: 0;
`;

const Footer = styled.div`
  width: 100%;
  padding: 30px 0 50px;
  display: flex;
  justify-content: center;
`;

const HomePage = () => {
  useEffect(() => {
    if (getCurrentUser()) router.push('/home');
  }, []);

  return (
    <div
      className="container"
      css={css`
        padding: 0;
        top: 0;
        background-color: #f2faff;
        overflow: hidden;
      `}
    >
      <Head>
        <title>Fest</title>
      </Head>
      <Header>
        <div>🎉</div>
        <div>
          <Button
            color="secondary"
            size="smaller"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
        </div>
      </Header>
      <Main>
        <CircularGradient
          css={css`
            top: 0;
            left: 40%;
          `}
        />
        <HeadingSection
          css={css`
            z-index: 10;
          `}
        >
          <Heading
            css={css`
              margin-top: 80px;
              color: #5200ff;
              font-family: 'Greycliff CF';
            `}
          >
            A home for fans and creators
          </Heading>
          <Text
            css={css`
              text-align: center;
            `}
          >
            Token-gated communities backed by the blockchain
          </Text>
          <Spacing size="small" />
          <Button
            color="primary"
            size="small"
            onClick={() => router.push('/waitlist')}
          >
            Get early access
          </Button>
        </HeadingSection>
      </Main>
      <Section>
        <FeatureCollection
          features={[
            {
              title: 'Exclusive token-gated communities',
              description:
                'Share special content with your community on Fest or your Discord server.',
              color: colors.greenEmerald,
              imageUrl: '/images/home/features/feature-card-stars-green.png'
            },
            {
              title: 'Social collectables',
              description:
                'Turn your images or YouTube videos into tokens, and build communities around them.',
              color: colors.redViolet,
              imageUrl: '/images/home/features/feature-card-hourglass.png'
            },
            {
              title: 'No crypto knowledge required',
              description:
                "You don't need any crypto to get started. Not even a wallet.",
              color: colors.blueCrypto,
              imageUrl: '/images/home/features/feature-card-padlock.png'
            },
            {
              title: 'Included marketplace',
              description:
                'In-platform marketplace for members to trade collectables.',
              color: colors.orangeLava,
              imageUrl: '/images/home/features/feature-card-star-orange.png'
            },
            {
              title: 'Easily buy crypto',
              description: 'Quickly and easily buy crypto through Fest.',
              color: colors.yellow,
              imageUrl: '/images/home/features/feature-card-coin.png'
            },
            {
              title: 'Zero gas fees',
              description: 'Gas fees? What even are they?',
              color: colors.black,
              imageUrl: '/images/home/features/feature-card-circle.png'
            }
          ]}
        />
      </Section>
      <Section>
        <div
          css={css`
            background-color: rgba(255, 255, 255, 0.5);
            text-align: center;
            padding: 30px 50px;
            border-radius: ${corners.lg};

            @media screen and (max-width: 500px) {
              padding: 30px 20px;
            }
          `}
        >
          <h2>What is Fest?</h2>
          <p style={{ paddingTop: 10 }}>
            A social platform for creators to build exclusive, token-gated
            communities for their top fans.
          </p>
          <div style={{ paddingTop: 20 }}></div>
          <Link href="https://www.notion.so/fested/Litepaper" target={'_blank'}>
            Read the Litepaper
          </Link>
        </div>
      </Section>
      <Section>
        <SectionSplit>
          <MultiFeatureCard
            title="For creators"
            image="/images/home/mobile-create-token.png"
            color={colors.orangeLavaLight}
            borderColor={colors.orangeLava}
          >
            <MultiFeatureCard.Feature>
              Be supported by your top fans
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              One safe space for your audience
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              Earn lifetime royalties on all sales
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              100% free minting and community platform
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              Zero gas fees (for custodial wallets)
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              Discord bot to restrict server access to fans
            </MultiFeatureCard.Feature>
            <MultiFeatureCard.Feature>
              Better connect with you fans
            </MultiFeatureCard.Feature>
          </MultiFeatureCard>

          <Accordion>
            <Accordion.Section heading="Can I take my tokens elsewhere?">
              Tokens aren&apos;t restricted to the Fest platform. You can take
              them anywhere, including selling them on marketplaces like
              OpenSea.
            </Accordion.Section>
            <Accordion.Section heading="What is a wallet?">
              A wallet is your identity on the blockchain. Fest offers the
              option to connect your own wallet (like MetaMask) or create one
              with us (using just your email address).
            </Accordion.Section>
            <Accordion.Section heading="Do you charge any fees?">
              We do not charge any fees for signing up to Fest, creating any
              tokens, and sharing content. We will take out a small percentage
              only when you sell a token to someone.
            </Accordion.Section>
            <Accordion.Section heading="What are gas fees?">
              Executing operations on the blockchain, such as minting,
              isn&apos;t free. To perform such transactions, a small amount of
              cryptocurrency needs to be paid. However, if you&apos;re using a
              Fest Wallet, this isn&apos;t something you should worry about -
              all your transactions will be completely free!
            </Accordion.Section>
            <Accordion.Section heading="How do I buy crypto?">
              We partner with a third-party service to help you easily buy
              crypto without ever leaving Fest. Easily top up by visiting your
              Wallet page.
            </Accordion.Section>
          </Accordion>
        </SectionSplit>
      </Section>
      <Footer>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            color: ${colors.black};
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
