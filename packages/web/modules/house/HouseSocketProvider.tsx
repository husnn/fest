import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const HouseSocketContext = React.createContext(null);

export const HouseSocketProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    setSocket(
      io(process.env.NEXT_PUBLIC_HOUSE_URL, {
        path: '/socket',
        withCredentials: true
      })
    );
  }, []);

  return (
    <HouseSocketContext.Provider value={socket}>
      {children}
    </HouseSocketContext.Provider>
  );
};

export default HouseSocketProvider;
