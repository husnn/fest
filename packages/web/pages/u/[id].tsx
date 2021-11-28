import { Button, Link } from '../../ui';
import React, { useEffect, useState } from 'react';
import { TokenDTO, TokenOwnedDTO, UserDTO } from '@fanbase/shared';
import {
  getCurrentUser,
  saveCurrentUser
} from '../../modules/auth/authStorage';
import { getDisplayName, getTokenOwnershipUrl, getTokenUrl } from '../../utils';
import useTabs, { Tab, Tabs } from '../../modules/navigation/useTabs';

import ApiClient from '../../modules/api/ApiClient';
import ButtonGroup from '../../ui/ButtonGroup';
import Head from 'next/head';
import ResponsiveTabs from '../../ui/ResponsiveTabs';
import TokensCreated from '../../components/TokensCreated';
import TokensOwned from '../../components/TokensOwned';
import styles from '../../styles/Profile.module.scss';
import useAuthentication from '../../modules/auth/useAuthentication';
import { useHeader } from '../../modules/navigation';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  useHeader();

  const router = useRouter();

  const [user, setUser] = useState<UserDTO>();

  const { currentUser, setCurrentUser } = useAuthentication();

  const [followed, setFollowed] = useState(true);

  const { initTabs, tabSelected, selectTab } = useTabs();

  const TABS = {
    COMMUNITIES: {
      id: 'communities',
      title: 'Communities'
    },
    TOKENS_CREATED: {
      id: 'tokens_created',
      title: 'Tokens Created'
    },
    TOKENS_OWNED: {
      id: 'tokens_owned',
      title: 'Tokens Owned'
    }
  } as Tabs;

  const { id } = router.query;

  const fetchUser = async () => {
    try {
      const response = await ApiClient.instance?.getUser(id as string);

      const { user } = response;

      // if (user.username) {
      //   router.replace(getProfileUrl(user));
      // }

      setUser(user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    initTabs(TABS);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchUser();
  }, [id]);

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
      <Head>
        <title>{(user && getDisplayName(user)) || id}</title>
      </Head>
      <div className={styles.header}>
        <div className={styles.headerBg}></div>
        <div className={'avatar ' + styles.headerAvatar}></div>
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
                <ButtonGroup
                  dropdown={
                    <React.Fragment>
                      {/* <Button color="primary" size="small">
                        Buy coins
                      </Button> */}
                      <Button color="secondary" size="small">
                        Message
                      </Button>
                    </React.Fragment>
                  }
                >
                  <Button
                    color={followed ? 'normal' : 'secondary'}
                    size="small"
                  >
                    {followed ? 'Unfollow' : 'Follow'}
                  </Button>
                </ButtonGroup>
              ) : (
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
              <div className={styles.communitiesTab}></div>
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
