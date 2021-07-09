/** @jsxImportSource @emotion/react */

import React, { useState } from 'react';

import styled from '@emotion/styled';

import { useHeader } from '../modules/navigation';
import { Link } from '../ui';

export type HeaderLinkType = {
  id: string;
  title?: string;
  route?: string;
  visible?: boolean;
  children?: HeaderLinkType[];
  render?: () => React.ReactNode;
  onClick?: () => void;
};

export type HeaderLinkProps = {
  [key: string]: any;
};

type HeaderProps = {
  links?: HeaderLinkType[];
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
`;

const HeaderLinksContainer = styled.div`
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;

  > * + * {
    margin-left: 30px;
  }

  a {
    width: 100%;
    opacity: 0.7;
  }

  a:hover {
    opacity: 0.9;
  }

  @media screen and (max-width: 500px) {
    display: none;
  }
`;

const LinkDropdown = styled.div`
  min-width: 180px;
  padding: 10px 0;
  margin-top: 20px;
  background: white;
  position: absolute;
  visibility: hidden;
  display: flex;
  flex-direction: column;
  transform: translateX(-50%);
  border-radius: 10px;
  box-shadow: 3px 3px 20px 2px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 200ms ease 100ms;
  z-index: 1;

  // gap: 20px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    // gap: 20px;

    span {
      width: 100%;
      margin: 0;
      padding: 10px 20px;
      display: flex;
      flex-direction: column;
      cursor: pointer;

      a {
        width: 100%;
        float: left;
      }

      &:hover {
        background-color: #eee;
      }
    }
  }
`;

const HeaderLinkContainer = styled.span`
  &:hover {
    > div {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const MobileMenu = styled.div<{ open: boolean }>`
  width: 100%;
  position: fixed;
  top: 80px;
  right: 0;
  left: 0;
  padding: 20px 0;
  background: #fff;
  flex-direction: column;
  border-radius: 0 0 20px 20px;
  box-shadow: 4px 8px 20px 4px rgba(0, 0, 0, 0.05);
  z-index: 98;

  > * + * {
    margin-top: 30px;
  }

  .links {
    display: flex;
    flex-direction: column-reverse;

    .mobile-link > a {
      display: block;
      padding: 20px 20px;

      &:hover {
        background-color: #eee;
      }
    }
  }

  .mobile-link {
    opacity: 0.9;
  }

  display: none;

  @media screen and (max-width: 500px) {
    display: ${(props) => (props.open ? 'flex' : 'none')};
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { links } = useHeader();

  // const [linksOpen, setLinksOpen] = useState<{ [level: string]: number }>();

  const HeaderLink = ({ link }: { link: HeaderLinkType }) => (
    <Link
      href={link.route}
      expandable={link.children != null && !link.render}
      onClick={() => (link.onClick ? link.onClick() : null)}
    >
      {link.render ? link.render() : link.title}
    </Link>
  );

  const HeaderLinks = ({
    links,
    level = 0
  }: {
    links: HeaderLinkType[];
    level?: number;
  }) => (
    <HeaderLinksContainer>
      {links.map((link: HeaderLinkType, index: number) => {
        if (link.visible === false) return null;

        return (
          <HeaderLinkContainer
            key={index}
            onMouseEnter={() => {
              // setLinksOpen({ ...linksOpen, [level]: index });
            }}
            onMouseLeave={() => {
              // setLinksOpen({ ...linksOpen, [level]: null });
            }}
          >
            <HeaderLink link={link} />
            {link.children && (
              <LinkDropdown>
                <HeaderLinks links={link.children} level={level + 1} />
              </LinkDropdown>
            )}
          </HeaderLinkContainer>
        );
      })}
    </HeaderLinksContainer>
  );

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Link href="/">
          <h2>Fanbase</h2>
        </Link>
        {links && <HeaderLinks links={links} />}
        <MenuClose
          open={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        />
      </HeaderWrapper>
      <MobileMenu open={mobileOpen}>
        <div className="links">
          {links.map((link: HeaderLinkType, index: number) =>
            link.visible ? (
              <div className="mobile-link" key={index}>
                <Link href={link.route}>
                  <h4>{link.title}</h4>
                </Link>
              </div>
            ) : null
          )}
        </div>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
