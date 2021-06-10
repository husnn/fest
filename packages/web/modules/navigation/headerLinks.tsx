import { CurrentUser } from '@fanbase/shared';

import { HeaderLink, HeaderLinkProps } from '../../components/Header';
import Button from '../../ui/Button';
import { getDisplayName, getProfileUrl, specific } from '../../utils';

export const headerLinks = specific<{
  [key: string]: HeaderLink | ((props: HeaderLinkProps) => HeaderLink);
}>()({
  Home: {
    name: 'Home',
    route: '/'
  },
  CreateToken: {
    name: 'Create token',
    route: '/create-token'
  },
  Profile: (user: CurrentUser) => ({
    name: getDisplayName(user),
    route: getProfileUrl(user)
  }),
  Login: ({ onClick, isAuthenticated }: HeaderLinkProps) => ({
    name: 'Login',
    render: () => (
      <span onClick={onClick}>
        {isAuthenticated ? (
          <Button color="normal" size="small">
            Sign out
          </Button>
        ) : (
          <Button color="secondary" size="small">
            Login
          </Button>
        )}
      </span>
    )
  })
});

export default headerLinks;
