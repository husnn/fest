import { HouseSocketContext } from './HouseSocketProvider';
import React from 'react';
import { Socket } from 'socket.io-client';

export const useHouseSocket = () => {
  return React.useContext<Socket>(HouseSocketContext);
};

export default useHouseSocket;
