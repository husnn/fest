/** @jsxImportSource @emotion/react */

import React from 'react';

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
  background-color: rgba(255, 255, 255, 0.8);
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

const Header: React.FC<HeaderProps> = () => {
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
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;
