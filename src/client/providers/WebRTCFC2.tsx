import React, { createContext, MutableRefObject, Ref, useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from './WebSocket';
import { Socket } from 'socket.io';
import { trace } from '../../shared/trace';
import { Button } from '@material-ui/core';

const tap = fn => x => (fn(x), x);


export const WebRTCContext = createContext(null);

export type SocketID = string

export interface IWebRTCCredentials {
  socketId: SocketID
  localDescription?: RTCSessionDescription
}


const WebRTCProvider = ({ children }) => {

  const { socket: io } = useContext(WebSocketContext);

  let peer: RTCPeerConnection;
  let data: MutableRefObject<RTCDataChannel> = useRef();

  const peers: Map<SocketID, RTCPeerConnection> = new Map();

  let isHost: boolean = false;
  let userId: string;
  let otherUser: string;

  const WebRTCCredentials: IWebRTCCredentials = {
    socketId: '',
    localDescription: null,
  };

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.1.google.com:19302' },
      // { urls: 'turn:127.0.0.1:3478' }
    ],
  };

  const [connecting, setConnecting] = useState(true);


  useEffect(() => {
    connect()
      .then((peer) => {
        console.log('Connected', {
          isHost,
          userId,
          otherUser,
          peer,
        });
        setConnecting(false);
      });
    return () => {
      peer.close();
    };
  }, []);


  const connect = () => new Promise((res, rej) => {

    async function connectToUser(userId: string) {
      peer = new RTCPeerConnection(configuration);
      data.current = await peer.createDataChannel('chat');
      data.current.onopen = () => {
        console.log('Data channel opened');
        res(peer);
      };
      data.current.onclose = () => {
        console.log('Data channel closed');
        peer.close()
      }
      data.current.onmessage = (e) => (console.log('Data channel message', e.data));

      peer.onicecandidate = e => {
        if (connecting && e.candidate) {
          io.emit('new-ice-candidate', {
            host: true,
            candidate: e.candidate,
            origin: userId,
            target: otherUser,
          });
        }
      };
      peer.oniceconnectionstatechange = e => console.log('host:iceStateChange', e);
      peer.onconnectionstatechange = e => console.log('host:onconnectionstatechange', e);

      return peer;
    }

    const sendOffer = async (description: RTCSessionDescription): Promise<{ answer: RTCSessionDescription }> => new Promise((res, rej) => {
      io.emit('offer', {
        origin: userId,
        target: otherUser,
        offer: description,
      });
      io.on('answer', ({ answer }) => {
        res({ answer });
      });
    });

    const sendAnswer = async ({ answer }) => {
      await io.emit('answer', {
        origin: userId,
        target: otherUser,
        answer,
      });
    };

    const createSlaveConnection = () => {
      const slave = peer = new RTCPeerConnection(configuration);
      slave.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        if (connecting && e.candidate) {
          io.emit('new-ice-candidate', {
            slave: true,
            candidate: e.candidate,
            target: otherUser,
          });
        }
      };
      slave.oniceconnectionstatechange = e => console.log('slave:iceStateChange', e);

      slave.onnegotiationneeded = e => console.log('slave:onnegotiationneeded', e);
      slave.onconnectionstatechange = e => console.log('slave:onconnectionstatechange', e);
      // handle data connection
      peer.ondatachannel = (event) => {
        data.current = event.channel;
        data.current.onopen = () => {
          console.log('Slave connection open');
          res(peer);
        };
        data.current.onclose = () => {
          console.log('Slave connection closed');
          peer.close()
        }
        data.current.onmessage = (event) => {
          console.log('Slave:message', event.data);
        };
      };
      return peer;
    };

    io.emit('create or join room', { roomID: location.pathname });

    io.on('created room', (message) => {
      isHost = true;
      userId = message.userId;
      // wait for another user to connect
    });

    // if the room doesn't exist create it and wait for connections
    io.on('another user joined', (message) => {
      otherUser = message.guest;
      connectToUser(otherUser)
        .then((host) => {
          host.onnegotiationneeded = e =>
            host.createOffer()
              .then(tap(d => host.setLocalDescription(d)))
              .then(sendOffer)
              .then(({ answer }) => host.setRemoteDescription(answer));
        });
    });

    // if the room exists join it
    io.on('joined room', (message) => {
      userId = message.userId;
      otherUser = message.host;
      console.log('You are the slave awaiting connection from master', message);
    });

    io.on('offer', ({ offer }: { offer: RTCSessionDescription }) => {
      const slave = createSlaveConnection();
      slave.setRemoteDescription(offer)
        .then(() => {
          return slave.createAnswer()
            .then(async (answer: RTCSessionDescription) => {
              await slave.setLocalDescription(answer);
              return { answer };
            })
            .then(tap(sendAnswer));
        });
    });

    io.on('new-ice-candidate', async (message) => {
      console.log('new-ice-candidate', message);
      await peer.addIceCandidate(message.candidate);
    });
  });


  const subscribers: any[] = [];

  const sendMessage = (message) => {
    if (data.current) {
      data.current.send(message);
    }
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
  };

  const unsubscribe = (fn) => {
    subscribers.push(fn);
    const index = subscribers.indexOf(fn);
    if (~index) {
      subscribers.splice(index, 1);
    }
  };

  const [message, setMessage] = useState('message');

  const handleKeypress = e => {
    setMessage(e.currentTarget.value);
  };

  const send = e => {
    data.current.send(message);
    setMessage('');
  };


  // return (
  //   <div>
  //     <input onChange={handleKeypress} value={message} type="text" />
  //     <Button onClick={send}>Send</Button>
  //   </div>
  // )

  return (
    <>
      <WebRTCContext.Provider value={{
        peer: peer,
        sendMessage: sendMessage,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
      }}>
        {(connecting) ? <h1>Loading...</h1> : children}
        {/*{children}*/}
      </WebRTCContext.Provider>
    </>
  );

};

export default WebRTCProvider;
