import React from 'react';

import Modal, { ModalProps } from './Modal';

type Alertbox = ModalProps;

export const Alertbox = (props: Alertbox) => {
  return <Modal {...props} style={{ paddingBottom: 50 }} />;
};

export default Alertbox;
