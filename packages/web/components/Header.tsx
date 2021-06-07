/** @jsxImportSource @emotion/react */
import React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useHeader } from '../modules/navigation';
import { Link } from '../ui';

export interface HeaderLink {
  name: string;
  route?: string;
  visible?: boolean;
  nested?: HeaderLink[];
  render?: () => React.ReactNode;
};

export type HeaderLinkProps = {
  onClick?: () => void;
}

type HeaderProps = {
  links?: HeaderLink[];
};

const HeaderContainer = styled.div`
  height: 80px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid #eee;
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

const HeaderLinks = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
`;

const Header: React.FC<HeaderProps> = () => {
  const { links } = useHeader();

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Link href="/"><h2>Fanbase</h2></Link>
        <div
          className="header__right"
          css={css`
            float: right;
          `}
        >
          {links && (
            <HeaderLinks>
              {links.map((link: HeaderLink, index: number) => {
                return link.visible !== false
                  ? (
                  <Link key={index} href={link.route}>
                    {link.render
                      ? (
                          link.render()
                        )
                      : (
                          link.name
                        )}
                  </Link>
                    )
                  : null;
              })}
            </HeaderLinks>
          )}
        </div>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;
