import React from 'react';

import Modal, { ModalProps } from './Modal';

type Alertbox = ModalProps;

export const Alertbox = (props: Alertbox) => {
  return <Modal {...props}>{props.children}</Modal>;
};

export default Alertbox;
