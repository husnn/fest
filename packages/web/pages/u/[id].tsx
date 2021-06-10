import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { User } from '@fanbase/shared';

import ApiClient from '../../modules/api/ApiClient';
import { getCurrentUser, saveCurrentUser } from '../../modules/auth/authStorage';
import useAuthentication from '../../modules/auth/useAuthentication';
import useTabs, { Tab, Tabs } from '../../modules/navigation/useTabs';
import styles from '../../styles/Profile.module.scss';
import { Button, Link } from '../../ui';
import ButtonGroup from '../../ui/ButtonGroup';
import ResponsiveTabs from '../../ui/ResponsiveTabs';
import { getDisplayName, getProfileUrl } from '../../utils';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User>();

  const { currentUser, setCurrentUser } = useAuthentication();

  const [followed, setFollowed] = useState(true);

  const { initTabs, tabSelected, selectTab } = useTabs();

  const TABS = {
    POSTS: {
      id: 'posts',
      title: 'Posts'
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

      if (user.username) {
        router.replace(getProfileUrl(user));
      }

      setUser(user);
    } catch (err) {}
  };

  useEffect(() => {
    initTabs(TABS);
    fetchUser();
  }, []);

  const isSelf =
    currentUser && (id === currentUser?.username || id === currentUser?.id);

  useEffect(() => {
    if (user && isSelf) {
      let currentUser = getCurrentUser();
      Object.assign(currentUser, user);

      setCurrentUser(currentUser);
      saveCurrentUser(currentUser);
    }
  }, [user]);

  return (
    <div>
      <Head>
        <title>{(user && getDisplayName(user)) || id}</title>
      </Head>
      <div className="boxed">
        <div className={styles.header}>
          <div className={styles.headerBg}></div>
          <div className={'avatar ' + styles.headerAvatar}></div>
          <div className={styles.headerContent}>
            <div className={styles.headerUserInfo}>
              <h3 className={styles.headerName}>
                {user ? getDisplayName(user) : null}
              </h3>
              {user?.bio && <p style={{ marginTop: 10 }}>{user.bio}</p>}
            </div>
            <div className={styles.headerActions}>
              {!isSelf ? (
                <ButtonGroup
                  dropdown={
                    <React.Fragment>
                      <Button color="primary" size="small">
                        Buy coins
                      </Button>
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
              )}
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
          <div className={styles.sidebar}>
            <ResponsiveTabs
              tabs={Object.values(TABS)}
              onTabSelected={(tab: Tab) => {
                selectTab(tab);
              }}
            />
          </div>
          <div className={styles.tabContent}>
            {tabSelected?.id == TABS.POSTS.id && (
              <div className={styles.postsTab}>
                <p>THIS IS THE Posts TAB</p>
              </div>
            )}
            {tabSelected?.id == TABS.TOKENS_CREATED.id && (
              <div className={styles.tokensCreated}>
                <div className="you-created"></div>
              </div>
            )}
            {tabSelected?.id == TABS.TOKENS_OWNED.id && (
              <div className={styles.tokensCreated}>
                <div className="you-own">
                  <p>Tokens owned</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  };
};
