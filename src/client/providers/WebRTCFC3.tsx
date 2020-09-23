import React, { createContext, MutableRefObject, Ref, useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from './WebSocket';

import Node from '../webrtc/Node'

export const WebRTCContext = createContext(null)

export type SocketID = string

export interface IWebRTCCredentials {
  id?: SocketID
}

const WebRTCProvider = ({ children }) => {

  const [connected, setConnected] = useState(false)

  const ws = useContext(WebSocketContext)

  let webRTCConnection = {
    node: null
  }

  useEffect(() => {
    Node.create({
      socket: ws.socket,
    })
      .then((node) => {
        webRTCConnection.node = node
        setConnected(true)
      })

    return () => {
      webRTCConnection.node.disconnect()
    }
  }, [])


  return (
    <WebRTCContext.Provider value={webRTCConnection}>
      {connected ? children : <h1>Connecting</h1>}
    </WebRTCContext.Provider>
  )

}


export default WebRTCProvider
