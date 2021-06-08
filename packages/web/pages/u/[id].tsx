import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import useAuthentication from '../../modules/auth/useAuthentication';
import { headerLinks, useHeader } from '../../modules/navigation';
import styles from '../../styles/Profile.module.scss';
import { Button } from '../../ui';
import { getDisplayName } from '../../utils';

export default function ProfilePage() {
  const router = useRouter();
  const { setLinks } = useHeader();

  const [user, setUser] = useState();
  const { currentUser, clearAuth } = useAuthentication();

  const [followed, setFollowed] = useState(true);

  const { id } = router.query;

  useEffect(() => {
    // setLinks();
  }, []);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  return (
    <div>
      <Head>
        <title>{id}</title>
      </Head>
      <div className="boxed">
        <div className={styles.profileHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}></div>
            <div>
              <h3 className={styles.displayName}>
                {user ? getDisplayName(user) : null}
              </h3>
              <p>I have been a YouTube creator since the early 2000s.</p>
            </div>
          </div>
          <div className={styles.userActions}>
            <Button color="primary" size="small">
              Buy coins
            </Button>
            <Button color="secondary" size="small">
              Message
            </Button>
            <Button color={followed ? 'ghost' : 'secondary'} size="small">
              {followed ? 'Unfollow' : 'Follow'}
            </Button>
          </div>

          <div className="stats">
            <div className="fans"></div>
            <div className="coin-price"></div>
            <div className="yt-subs"></div>
            <div className="twitter-followers"></div>
          </div>

          <div className={styles.content}>
            <div className="tabs">
              <div className="tab-content" title="Posts"></div>
              <div className="tab-content" title="Coins held"></div>
              <div className="tab-content" title="Tokens created">
                <div className="you-own"></div>
              </div>
            </div>
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
