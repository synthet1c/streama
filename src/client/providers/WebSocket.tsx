import io, { Socket } from 'socket.io-client';
import jsonParser from 'socket.io-json-parser'
import React, { Component, createContext, FC, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { updateChatLog } from '../slices/chat';
import { Message } from '../types/message';

export const WebSocketContext = createContext(null)

export interface WebSocketProps {
  children: any
}

const WebSocketProvider = ({ children }: WebSocketProps): any => {

  const dispatch = useDispatch()
  let socket = io('http://localhost:3000');
  let ws

  const sendMessage = (roomId, message: Message) => {
    const payload = {
      message
    }
    // socket.emit('message', message)
    dispatch(updateChatLog(message))
  }

  socket.on('message', (message) => {
    // console.log('socket.io::message', message)
    dispatch(updateChatLog(message))
  })

  socket.on('action', (action) => {
    dispatch(action)
  })

  socket.on('stream', (stream) => {
    console.log('stream', stream)
  })

  sendMessage('message', {
    id: '1',
    createdAt: Date.now(),
    content: 'Sup',
    user: 'Foonta'
  })

  ws = {
    socket,
    sendMessage
  }

  return (
    <>
      <WebSocketContext.Provider value={ws}>
        {children}
      </WebSocketContext.Provider>
    </>
  )
}

export default WebSocketProvider
