import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import styled from '@emotion/styled';

import { corners } from '../styles/constants';
import Button from './Button';

type ModalProps = {
  show: boolean;
  closing?: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
  zeroPadding?: boolean;
  backable?: boolean;
  ok?: string;
  okEnabled?: boolean;
  onBackPressed?: () => void;
  onOkPressed?: () => void;
  requestClose?: () => void;
};

const ModalTitle = styled.h3``;

const ModalDescription = styled.p`
  margin: 10px 0 0;
  font-size: 10pt;
  opacity: 0.5;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: black;
  opacity: 0.25;
  transition-delay: 100ms;
  z-index: 999;
`;

type ModalContainerProps = {
  zeroPadding?: boolean;
};

const ModalContainer = styled.div<ModalContainerProps>`
  width: 100%;
  min-height: 120px;
  max-height: 80%;
  position: fixed;
  padding: ${(props) => (props.zeroPadding ? '0' : '30px')};
  display: flex;
  flex-direction: column;
  background-color: white;
  z-index: 999;
  overflow-y: scroll;
  // gap: 20px;

  > * + * {
    margin-top: 20px;
  }

  @media screen and (max-width: 499px) {
    min-height: 200px;
    bottom: 0;
    right: 0;
    left: 0;
    padding: 30px;
    border-radius: ${corners.lg} ${corners.lg} 0 0;
  }

  @media screen and (min-width: 500px) {
    max-width: 450px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: ${corners.lg};
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  // gap: 20px;

  > * + * {
    margin-top: 15px;
  }
`;

const ModalHead = styled.div`
  padding: 20px 0 0;
`;

const ModalTitleBlock = styled.div`
  display: flex;
  flex-direction: row;
  // gap: 15px;

  > * + * {
    margin-left: 15px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  // gap: 15px;

  > * + * {
    margin-top: 15px;
  }
`;

const ModalBody = styled.div``;

const Modal: React.FC<ModalProps> = ({
  show,
  closing,
  children,
  title,
  description,
  zeroPadding,
  backable,
  onBackPressed,
  ok,
  okEnabled,
  onOkPressed,
  requestClose
}: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [inProp, setInProp] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalWrapper = show ? (
    <div id="modal__wrapper">
      <CSSTransition
        in={!closing}
        timeout={500}
        classNames="modaloverlay"
        appear
      >
        <ModalOverlay
          id="modal__overlay"
          onClick={() => (requestClose ? requestClose() : null)}
        ></ModalOverlay>
      </CSSTransition>

      <CSSTransition in={!closing} timeout={500} classNames="modal" appear>
        <ModalContainer id="modal__content" zeroPadding={zeroPadding}>
          <CSSTransition
            in={inProp}
            timeout={300}
            classNames={backable ? 'modal-step' : 'modal-step-first'}
            onEntered={() => setInProp(false)}
          >
            <ModalContent>
              {(title || description) && (
                <ModalHead>
                  <ModalTitleBlock
                    style={backable ? { cursor: 'pointer' } : null}
                    onClick={() => (onBackPressed ? onBackPressed() : null)}
                  >
                    {backable && (
                      <Image
                        src="/images/ic-back.svg"
                        width="10"
                        height="10"
                        onClick={() => (onBackPressed ? onBackPressed() : null)}
                      />
                    )}
                    {title && <ModalTitle>{title}</ModalTitle>}
                  </ModalTitleBlock>
                  {description && (
                    <ModalDescription>{description}</ModalDescription>
                  )}
                </ModalHead>
              )}
              <ModalBody>{children}</ModalBody>
              {ok && (
                <ModalActions>
                  {ok && (
                    <Button
                      color="primary"
                      disabled={!okEnabled}
                      onClick={() => {
                        onOkPressed();
                        setInProp(true);
                      }}
                    >
                      {ok}
                    </Button>
                  )}
                </ModalActions>
              )}
            </ModalContent>
          </CSSTransition>
        </ModalContainer>
      </CSSTransition>
    </div>
  ) : null;

  return isBrowser
    ? ReactDOM.createPortal(modalWrapper, document.getElementById('modal'))
    : null;
};

export default Modal;
