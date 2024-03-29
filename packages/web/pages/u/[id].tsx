import {
  getHomeUrl,
  getTokenOwnershipUrl,
  getTokenUrl,
  GetUserResponse,
  TokenDTO,
  TokenOwnedDTO,
  UserDTO
} from '@fest/shared';
import { useEffect, useState } from 'react';
import {
  getCurrentUser,
  saveCurrentUser
} from '../../modules/auth/authStorage';
import useTabs, { Tab, Tabs } from '../../modules/navigation/useTabs';
import { Button, Link } from '../../ui';

import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Avatar } from '../../components/Avatar';
import TokensCreated from '../../components/TokensCreated';
import TokensOwned from '../../components/TokensOwned';
import UserCommunities from '../../components/UserCommunities';
import ApiClient from '../../modules/api/ApiClient';
import useAuthentication from '../../modules/auth/useAuthentication';
import { useHeader } from '../../modules/navigation';
import styles from '../../styles/Profile.module.scss';
import ResponsiveTabs from '../../ui/ResponsiveTabs';
import { getDisplayName } from '../../utils';

export default function ProfilePage(props: { user?: UserDTO }) {
  useHeader();

  const router = useRouter();

  const [user, setUser] = useState<UserDTO>(props.user);

  const { currentUser, setCurrentUser } = useAuthentication();

  const [followed, setFollowed] = useState(true);

  const { initTabs, tabSelected, selectTab } = useTabs();

  const TABS = {
    TOKENS_CREATED: {
      id: 'tokens_created',
      title: 'Tokens Created'
    },
    TOKENS_OWNED: {
      id: 'tokens_owned',
      title: 'Tokens Owned'
    },
    COMMUNITIES: {
      id: 'communities',
      title: 'Communities'
    }
  } as Tabs;

  const { id } = router.query;

  useEffect(() => {
    initTabs(TABS);
  }, []);

  const isSelf =
    currentUser &&
    (id === currentUser.username ||
      id === currentUser.id ||
      user?.id === currentUser.id);

  useEffect(() => {
    if (isSelf) {
      const currentUser = getCurrentUser();

      if (user) {
        for (const key in user) {
          if (key in currentUser) {
            currentUser[key] = user[key];
          }
        }

        setCurrentUser(currentUser);
        saveCurrentUser(currentUser);
      }

      setUser(currentUser);
    }
  }, [isSelf]);

  return (
    <div className="boxed" style={{ padding: 0 }}>
      {user && (
        <NextSeo
          title={`${getDisplayName(user)} on Fest`}
          description={
            user.bio ||
            `View all tokens created and owned by ${getDisplayName(
              user
            )}, and which communities they are part of.`
          }
        />
      )}
      <Head>
        <title>{(user && getDisplayName(user)) || id}</title>
      </Head>
      <div className={styles.header}>
        <div className={styles.headerBg}></div>
        <Avatar className={styles.headerAvatar} user={user} size={80} />
        <div className={styles.headerContent}>
          <div className={styles.headerUserInfo}>
            <h4 className={styles.headerName}>
              {user ? getDisplayName(user) : null}
            </h4>
            {user?.bio && <p style={{ marginTop: 10 }}>{user.bio}</p>}
          </div>
          <div className={styles.headerActions}>
            {user ? (
              !isSelf ? (
                <span></span>
              ) : (
                // <ButtonGroup
                //   dropdown={
                //     <React.Fragment>
                //       {/* <Button color="primary" size="small">
                //         Buy coins
                //       </Button> */}
                //       <Button color="secondary" size="small">
                //         Message
                //       </Button>
                //     </React.Fragment>
                //   }
                // >
                //   <Button
                //     color={followed ? 'normal' : 'secondary'}
                //     size="small"
                //   >
                //     {followed ? 'Unfollow' : 'Follow'}
                //   </Button>
                // </ButtonGroup>
                <Link href="/settings">
                  <Button size="small" color="secondary">
                    Edit profile
                  </Button>
                </Link>
              )
            ) : null}
          </div>
        </div>

        {/* <div className="stats">
            <div className="fans"></div>
            <div className="coin-price"></div>
            <div className="yt-subs"></div>
            <div className="twitter-followers"></div>
          </div> */}
      </div>

      <div className={styles.content}>
        <ResponsiveTabs
          tabs={Object.values(TABS)}
          onTabSelected={(tab: Tab) => {
            selectTab(tab);
          }}
        />
        {user && (
          <div className={styles.tabContent}>
            {tabSelected?.id == TABS.COMMUNITIES.id && (
              <UserCommunities
                user={user.id}
                onCommunitySelected={(community) => {
                  router.push(getHomeUrl(community.id));
                }}
              />
            )}
            {tabSelected?.id == TABS.TOKENS_CREATED.id && (
              <TokensCreated
                user={user.id}
                onTokenSelected={(token: TokenDTO) => {
                  router.push(getTokenUrl(token));
                }}
              />
            )}
            {tabSelected?.id == TABS.TOKENS_OWNED.id && (
              <TokensOwned
                user={user.id}
                onTokenSelected={(token: TokenOwnedDTO) => {
                  router.push(`${getTokenOwnershipUrl(token.ownership)}`);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  let res: GetUserResponse;
  try {
    res = await ApiClient.getInstance().getUser(ctx.query.id);
  } catch (err) {
    console.log(err);
  }

  return { props: { user: res?.user || {} } };
}
