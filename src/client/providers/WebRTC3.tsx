import React, { Component, createContext, MutableRefObject, Ref, useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from './WebSocket';

import Node from '../webrtc/Node'

export const WebRTCContext = createContext(null)

export type SocketID = string

export interface IWebRTCCredentials {
  id?: SocketID
}

class WebRTCProvider extends Component {

  state = {
    connected: false
  }

  private node: Node

  static contextType = WebSocketContext

  public webRTCConnection =

  async componentDidMount() {
    return Node.create({
      socket: this.context.ws.socket,
    })
      .then((node) => {
        this.webRTCConnection.node = node
        this.webRTCConnection.peer = node
        // apply the cached subscriptions to the newly created webrtc node
        this.webRTCConnection.subscriptions.forEach(cb => node.on('message', cb))
        this.webRTCConnection.sendMessage = message => node.send(message, null, {
          type: 'message',
          payload: message,
          target: null,
        })
        this.webRTCConnection.subscribe = fn => node.on('message', fn)
        this.webRTCConnection.unsubscribe = fn => node.off('message', fn)

        this.webRTCConnection = {
          node: this.node,
          peer: this.node,
          subscriptions: [],
          subscribe(fn) {
            this.subscriptions.push(fn)
          },
          unsubscribe(fn) {
            const index = this.subscriptions.indexOf(fn)
            if (~index) {
              this.subscriptions.splice(index, 1)
            }
          },
          sendMessage: message => this.node.send(message, null, {
              type: 'message',
              payload: message,
              target: null,
            },
          ),
        }

        this.setState({ connected: true })
      })
  }

  useEffect(() => {


    return () => {
      webRTCConnection.node.disconnect()
    }
  }, [])


  return (
    !connected
      ? <h1>Connecting</h1>
      : (
        <WebRTCContext.Provider value={webRTCConnection}>
          {children}
        </WebRTCContext.Provider>
      )
  )

}


export default WebRTCProvider
