import React, { useEffect } from 'react';

import { HeaderLinkType } from '../../components/Header';
import { Button } from '../../ui';
import { getDisplayName, getProfileUrl } from '../../utils';
import useAuthentication from '../auth/useAuthentication';
import { HeaderContext } from './HeaderProvider';

export const useHeader = (toShow?: string[], toHide?: string[]) => {
  const context = React.useContext(HeaderContext);

  const { isAuthenticated, currentUser, clearAuth } = useAuthentication();

  const links: HeaderLinkType[] = [
    // {
    //   id: 'home',
    //   title: 'Home',
    //   route: '/'
    // },
    {
      id: 'create-token',
      title: 'Create token',
      route: '/create-token'
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
      route: '/login',
      render: () => (
        <Button color="secondary" size="small">
          Login
        </Button>
      )
    }
  ];

  const filteredLinks = () =>
    links.filter((link: HeaderLinkType) => {
      if (toShow) {
        return toShow.includes(link.id);
      } else if (toHide) {
        return !toHide.includes(link.id);
      }

      return link;
    });

  useEffect(() => {
    let linksToShow = filteredLinks();
    context.setLinks(linksToShow);
  }, [isAuthenticated, currentUser]);

  return context;
};

export default useHeader;
