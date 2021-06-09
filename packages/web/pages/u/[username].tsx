import { GetServerSideProps } from 'next';
import Error from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { GetUserResponse, User } from '@fanbase/shared';

import ApiClient from '../../modules/api/ApiClient';
import useAuthentication from '../../modules/auth/useAuthentication';
import useTabs, { Tab, Tabs } from '../../modules/navigation/useTabs';
import styles from '../../styles/Profile.module.scss';
import { Button, Link } from '../../ui';
import ButtonGroup from '../../ui/ButtonGroup';
import ResponsiveTabs from '../../ui/ResponsiveTabs';
import { getDisplayName } from '../../utils';

export default function ProfilePage({ errorCode }) {
  const router = useRouter();

  const [user, setUser] = useState<User>();
  const [isSelf, setSelf] = useState(false);

  const { currentUser } = useAuthentication();

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

  const { username } = router.query;

  useEffect(() => {
    initTabs(TABS);
  }, []);

  useEffect(() => {
    if (currentUser && username === currentUser.username) {
      setSelf(true);
    }

    ApiClient.instance
      ?.getUserByUsername(username as string)
      .then((response: GetUserResponse) => {
        setUser(response.user);
      })
      .catch((err) => {});
  }, [username, currentUser]);

  return (
    <div>
      <Head>
        <title>{username}</title>
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
              <p>I have been a YouTube creator since the early 2000s.</p>
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

          <div className="stats">
            <div className="fans"></div>
            <div className="coin-price"></div>
            <div className="yt-subs"></div>
            <div className="twitter-followers"></div>
          </div>
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
