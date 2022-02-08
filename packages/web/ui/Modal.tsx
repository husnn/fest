import React, { useEffect, useState } from 'react';

import Button from './Button';
import { CSSTransition } from 'react-transition-group';
import Image from 'next/image';
import Link from './Link';
import ReactDOM from 'react-dom';
import { corners } from '../styles/constants';
import styled from '@emotion/styled';

export type ModalProps = {
  show: boolean;
  closing?: boolean;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  error?: string;
  zeroPadding?: boolean;
  backable?: boolean;
  cancel?: string;
  ok?: string;
  okEnabled?: boolean;
  hasSteps?: boolean;
  style?: React.CSSProperties;
  onBackPressed?: () => void;
  onOkPressed?: () => void;
  requestClose?: () => void;
};

const ModalTitle = styled.h3``;

const ModalDescription = styled.p`
  margin: 10px 0 0;
  font-size: 10pt;
  color: #9a9a9a;
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

  > * + * {
    margin-top: 20px;
  }

  @media screen and (max-width: 500px) {
    bottom: 0;
    right: 0;
    left: 0;
    padding: ${(props) => (props.zeroPadding ? '0' : '30px')};
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

  > * + * {
    margin-top: 10px;
  }

  > form > * + * {
    margin-top: 10px;
  }
`;

const ModalHead = styled.div`
  padding: 20px 0 0;
`;

const ModalTitleBlock = styled.div`
  display: flex;
  flex-direction: row;

  > * + * {
    margin-left: 10px;
  }
`;

const ModalActions = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  > button {
    width: 100%;
  }

  > * + * {
    margin-top: 15px;
  }
`;

const ModalBody = styled.div`
  padding: 10px 0;
`;

const AuthError = styled.p`
  color: red;
  margin-top: 15px;
`;

const Modal: React.FC<ModalProps> = ({
  show,
  closing,
  children,
  title,
  description,
  error,
  zeroPadding,
  backable,
  onBackPressed,
  cancel,
  ok,
  okEnabled,
  hasSteps,
  style,
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
        <ModalContainer
          id="modal__content"
          zeroPadding={zeroPadding}
          style={style}
        >
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
              {children && (
                <ModalBody>
                  {children}
                  {error && (
                    <AuthError
                      dangerouslySetInnerHTML={{ __html: error }}
                      className="smaller"
                    />
                  )}
                </ModalBody>
              )}
              {(ok || cancel) && (
                <ModalActions>
                  {ok && (
                    <Button
                      type="submit"
                      color="primary"
                      disabled={!okEnabled}
                      onClick={() => {
                        onOkPressed();
                        if (hasSteps) setInProp(true);
                      }}
                    >
                      {ok}
                    </Button>
                  )}
                  {cancel && (
                    <Link
                      className="smaller"
                      onClick={() => {
                        requestClose();
                      }}
                    >
                      {cancel}
                    </Link>
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
