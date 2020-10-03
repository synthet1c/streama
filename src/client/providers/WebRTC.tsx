import React, { createContext,
  useContext,
  useEffect,
  useState,
  Suspense,
} from 'react';
import { WebSocketContext } from './WebSocket';

import Node from '../webrtc/Node';

export const WebRTCContext = createContext(null);

export type SocketID = string

export interface IWebRTCCredentials {
  id?: SocketID
}

const WebRTCProvider = ({ children }) => {

  const [connected, setConnected] = useState(false);
  const [api, setApi] = useState({})

  let node = Node.create()

  useEffect(() => {
    node.init()
  }, []);

  return (
    <Suspense fallback={<h1>Connecting</h1>}>
      <WebRTCContext.Provider value={node}>
        {children}
      </WebRTCContext.Provider>
    </Suspense>
  );

};


export default WebRTCProvider;
