import React, { useState } from 'react';

import styled from '@emotion/styled';

import { Link } from '../ui';
import { LinkType } from './Header';

const MenuContainer = styled.div`
  width: 100%;
  padding: 10px 0 20px;
  position: fixed;
  top: 80px;
  right: 0;
  left: 0;
  display: none;
  background: #fff;
  border-radius: 0 0 20px 20px;
  box-shadow: 4px 8px 20px 4px rgba(0, 0, 0, 0.05);
  user-select: none;

  @media screen and (max-width: 500px) {
    display: block;
  }
`;

const MenuItem = styled.div`
  margin-top: 5px;
`;

const MenuLink = styled.div<{ indentLevel?: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => `padding: 15px ${20 + 10 * props.indentLevel}px`};

  a {
    font-weight: bold;
    opacity: 0.7;
    flex: 1;

    &:hover {
      opacity: 0.9;
    }
  }

  &:hover {
    background: #eee;
  }

  img {
    width: ;
  }
`;

const LinkArrow = styled.div<{ open: boolean }>`
  width: 20px;
  height: 20px;
  background: url('/images/ic-arrow-down.svg');
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transform: ${(props) => props.open && `rotate(180deg)`};
`;

export type MobileMenuProps = {
  open: boolean;
  links: LinkType[];
};

export const MobileMenu = ({ open, links }: MobileMenuProps) => {
  const [linksOpen, setLinksOpen] = useState<{
    [level: string]: number;
  }>({
    0: null
  });

  const ItemContainer = ({ links, level = 0 }) => {
    return links.map((link: LinkType, index: number) => {
      const isOpen = linksOpen[level] == index;

      return link.visible != false ? (
        <MenuItem
          key={index}
          onClick={() => {
            link.onClick && link.onClick();
          }}
        >
          <MenuLink indentLevel={level}>
            <Link href={link.route}>
              {link.render ? link.render() : link.title}
            </Link>
            {link.children && (
              <LinkArrow
                open={isOpen}
                onClick={() => {
                  setLinksOpen({
                    ...linksOpen,
                    [level]: !isOpen ? index : null
                  });
                }}
              />
            )}
          </MenuLink>
          {link.children && isOpen && (
            <ItemContainer links={link.children} level={level + 1} />
          )}
        </MenuItem>
      ) : null;
    });
  };
  return open ? (
    <MenuContainer>
      <ItemContainer links={links} />
    </MenuContainer>
  ) : null;
};

export default MobileMenu;
