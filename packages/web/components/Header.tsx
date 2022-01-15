/** @jsxImportSource @emotion/react */

import React, { useEffect, useState } from 'react';

import { Link } from '../ui';
import MobileMenu from './MobileMenu';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';

export type LinkType = {
  id: string;
  title?: string;
  route?: string;
  visible?: boolean;
  children?: LinkType[];
  render?: () => React.ReactNode;
  onClick?: () => void;
};

export type HeaderLinkProps = {
  [key: string]: any;
};

type HeaderProps = {
  links?: LinkType[];
};

const HeaderContainer = styled.div`
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #eee;
  z-index: 99;
  backdrop-filter: blur(5px);
`;

const HeaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
`;

const HeaderMenu = styled.div`
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    width: 95%;
    margin: 0 auto;
    padding: 10px;
    border-radius: 10px;
    opacity: 0.5;
    white-space: nowrap;
  }

  a:hover {
    background: #f5f5f5;
    opacity: 0.9;
  }

  @media screen and (max-width: 500px) {
    display: none;
  }
`;

const HeaderItem = styled.span`
  &:hover {
    > div {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const LinkDropdown = styled.div`
  min-width: 180px;
  margin-top: 20px;
  padding: 10px 0;
  position: absolute;
  background: white;
  display: flex;
  justify-content: center;
  flex-direction: column;
  transform: translateX(-50%);
  box-shadow: 3px 3px 20px 2px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease 100ms;
  visibility: hidden;
  border-radius: 10px;
  opacity: 0;
  z-index: 1;

  a {
    padding: 10px 20px;
    display: block;
  }
`;

const MenuClose = styled.div<{ open: boolean }>`
  width: 16px;
  height: 16px;
  background-image: url('/images/${(props) =>
    props.open ? 'ic-close.svg' : 'ic-menu.svg'}');
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;

  display: none;

  @media screen and (max-width: 500px) {
    display: block;
  }
`;

const Header: React.FC<HeaderProps> = () => {
  const { links } = useHeader();

  const [mobileOpen, setMobileOpen] = useState(false);

  const HeaderLink = ({ link }: { link: LinkType }) => (
    <Link
      href={link.route}
      expandable={link.children != null}
      onClick={() => (link.onClick ? link.onClick() : null)}
    >
      {link.render ? link.render() : link.title}
    </Link>
  );

  const HeaderLinks = ({
    links,
    level = 0
  }: {
    links: LinkType[];
    level?: number;
  }) => (
    <React.Fragment>
      {links.map((link: LinkType, index: number) => {
        return link.visible != false ? (
          <HeaderItem key={index}>
            <HeaderLink link={link} />
            {link.children && (
              <LinkDropdown>
                <HeaderLinks links={link.children} level={level + 1} />
              </LinkDropdown>
            )}
          </HeaderItem>
        ) : null;
      })}
    </React.Fragment>
  );

  const [visibleCount, setVisibleCount] = useState(0);
  const [singleLink, setSingleLink] = useState(null);

  useEffect(() => {
    const visible = links.filter((link: LinkType) => link.visible);

    setVisibleCount(visible.length);

    setSingleLink(
      visible.length == 1 && !visible[0].children ? visible[0] : null
    );
  }, [links]);

  const { isAuthenticated } = useAuthentication();

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Link href={isAuthenticated ? '/home' : '/'}>
          <h2 style={{ fontFamily: 'Gilmer' }}>Fanbase</h2>
        </Link>
        {links && !singleLink && (
          <HeaderMenu>
            <HeaderLinks links={links} />
          </HeaderMenu>
        )}
        {links.length > 0 &&
          (!singleLink ? (
            <MenuClose
              open={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          ) : (
            <HeaderLink link={singleLink} />
          ))}
      </HeaderWrapper>
      <MobileMenu
        open={mobileOpen && !singleLink && visibleCount > 0}
        links={links}
      />
    </HeaderContainer>
  );
};

export default Header;
