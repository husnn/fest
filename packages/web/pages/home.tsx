import React, { useEffect, useState } from 'react';
import router, { useRouter } from 'next/router';

import { ApiClient } from '../modules/api';
import { Button } from '../ui';
import { CommunityDTO } from '@fanbase/shared';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import Modal from '../ui/Modal';
import { getCurrentUser } from '../modules/auth/authStorage';
import useAuthentication from '../modules/auth/useAuthentication';
import usePagination from '../modules/api/usePagination';

const HomePage = () => {
  const router = useRouter();

  const { c } = router.query;

  const { currentUser } = useAuthentication(true);

  const [creatingPost, setCreatingPost] = useState(false);

  useEffect(() => {
    if (!getCurrentUser()) router.push('/');
  }, []);

  const { data: communities } = usePagination<CommunityDTO>(
    (count: number, page: number, ...args) =>
      ApiClient.getInstance().getCommunitiesForUser(...args, count, page),
    [currentUser?.id]
  );

  return (
    <div className="container boxed">
      <Feed community={c as string} />
      <Modal
        show={creatingPost}
        requestClose={() => setCreatingPost(false)}
        zeroPadding
      >
        <Composer
          communities={communities}
          onSubmit={(text, community) => {
            ApiClient.getInstance().createPost({
              text,
              community
            });

            setCreatingPost(false);
          }}
        />
      </Modal>
      <Button
        color="primary"
        onClick={() => (!creatingPost ? setCreatingPost(true) : null)}
      >
        Create post
      </Button>
    </div>
  );
};

export default HomePage;
