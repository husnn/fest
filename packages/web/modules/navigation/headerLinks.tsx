import { HeaderLink, HeaderLinkProps } from '../../components/Header';
import Button from '../../ui/Button';
import { specific } from '../../utils';

export const headerLinks = specific<{
  [key: string]: HeaderLink |((props: HeaderLinkProps) => HeaderLink);
}>()({
  Home: {
    name: 'Home',
    route: '/'
  },
  CreateToken: {
    name: 'Create token',
    route: '/create-token'
  },
  Login: {
    name: 'Login',
    route: '/login',
    render: () => (
      <Button color="secondary" size="small">
        Login
      </Button>
    )
  },
  Signout: ({ onClick }: HeaderLinkProps) => {
    return {
      name: 'Sign out',
      render: () => (
        <Button color="normal" size="small" onClick={onClick}>
          Sign out
        </Button>
      )
    };
  }
});

export default headerLinks;
