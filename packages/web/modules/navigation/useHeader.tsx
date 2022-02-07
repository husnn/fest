import React, { useEffect, useState } from 'react';
import { getDisplayName, getProfileUrl } from '../../utils';

import { Button } from '../../ui';
import { HeaderContext } from './HeaderProvider';
import { LinkType } from '../../components/Header';
import useAuthentication from '../auth/useAuthentication';

export const useHeader = (toShow?: string[], toHide?: string[]) => {
  const context = React.useContext(HeaderContext);

  const { isAuthenticated, currentUser, clearAuth } = useAuthentication();

  const [redirectPath, setRedirectPath] = useState<string>();

  const links: LinkType[] = [
    // {
    //   id: 'home',
    //   title: 'Home',
    //   route: '/'
    // },
    {
      id: 'create-token',
      title: 'Create token',
      route: '/create-token',
      visible: !!currentUser && currentUser.isCreator
    },
    // {
    //   id: 'creator-program',
    //   title: 'Become a creator',
    //   route: '/creator',
    //   visible: !!currentUser && !currentUser.isCreator
    // },
    {
      id: 'market',
      title: 'Market',
      route: '/market',
      visible: isAuthenticated
    },
    {
      id: 'wallet',
      title: 'Wallet',
      route: '/wallet',
      visible: isAuthenticated
    },
    {
      id: 'profile',
      title: currentUser ? getDisplayName(currentUser) : '',
      route: currentUser ? getProfileUrl(currentUser) : '/',
      visible: currentUser != null,
      children: [
        {
          id: 'settings',
          title: 'Settings',
          route: '/settings'
        },
        {
          id: 'referral',
          title: 'Referral',
          route: '/referral'
        },
        {
          id: 'signout',
          title: 'Sign out',
          onClick: () => clearAuth()
        }
      ]
    },
    {
      id: 'login',
      title: 'Login',
      visible: !isAuthenticated,
      route: `/login${redirectPath ? `?redirect=${redirectPath}` : ''}`,
      render: () => (
        <Button color="secondary" size="small">
          Login
        </Button>
      )
    }
  ];

  const filteredLinks = () =>
    links.filter((link: LinkType) => {
      if (toShow) {
        return toShow.includes(link.id);
      } else if (toHide) {
        return !toHide.includes(link.id);
      }

      return link;
    });

  useEffect(() => {
    const linksToShow = filteredLinks();
    context.setLinks(linksToShow);
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setRedirectPath(currentPath !== '/' ? currentPath : null);
  }, []);

  return context;
};

export default useHeader;
