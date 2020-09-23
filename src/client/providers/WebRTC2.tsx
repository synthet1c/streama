import React, { Component, createContext, createRef, Ref, useRef } from 'react';
import { Button } from '@material-ui/core';
import { WebSocketContext } from './WebSocket';
import { Socket } from 'socket.io';
import { trace } from '../../shared/trace';

const tap = fn => x => (fn(x), x);


export const WebRTCContext = createContext(null);

export default class WebRTC extends Component {

  static contextType = WebSocketContext;

  private peer: RTCPeerConnection;
  private data: RTCDataChannel;

  private io: Socket;

  private isHost: boolean = false;
  private userId: string;
  private otherUser: string;

  private configuration = {
    iceServers: [
      { urls: 'stun:stun.1.google.com:19302' },
    ],
  };

  state = {
    message: 'message yo',
    connecting: false,
  };

  sendIOMessage(message: string, data: any) {
    this.context.socket.emit(message, data);
  }

  async connectToUser(userId: string) {
    this.peer = new RTCPeerConnection(this.configuration);
    this.data = await this.peer.createDataChannel('chat');
    this.data.onopen = () => (console.log('Data channel opened'));
    this.data.onmessage = (e) => (console.log('Data channel message', e.data));

    this.peer.onicecandidate = e => e.candidate && this.io.emit('new-ice-candidate', {
      host: true,
      candidate: e.candidate,
      origin: this.userId,
      target: this.otherUser,
    });
    this.peer.oniceconnectionstatechange = e => console.log('host:iceStateChange', e);
    this.peer.onconnectionstatechange = e => console.log('host:onconnectionstatechange', e);

    return this.peer;
  }

  sendOffer = async (description: RTCSessionDescription): Promise<{ answer: RTCSessionDescription }> => new Promise((res, rej) => {
    this.io.emit('offer', {
      origin: this.userId,
      target: this.otherUser,
      offer: description,
    });
    this.io.on('answer', ({ answer }) => {
      res({ answer });
    });
  });

  sendAnswer = async ({ answer }) => {
    await this.io.emit('answer', {
      origin: this.userId,
      target: this.otherUser,
      answer,
    });
  };

  createSlaveConnection() {
    const slave = this.peer = new RTCPeerConnection(this.configuration);
    slave.onicecandidate = e => e.candidate && this.io.emit('new-ice-candidate', {
      slave: true,
      candidate: e.candidate,
      target: this.otherUser,
    });
    slave.oniceconnectionstatechange = e => console.log('slave:iceStateChange', e);

    slave.onnegotiationneeded = e => console.log('slave:onnegotiationneeded', e);
    slave.onconnectionstatechange = e => console.log('slave:onconnectionstatechange', e);
    // handle data connection
    this.peer.ondatachannel = (event) => {
      this.data = event.channel;
      this.data.onopen = () => console.log('Slave connection open');
      this.data.onmessage = (event) => {
        console.log('Slave:message', event.data);
      };
    };
    return this.peer;
  }

  componentDidMount() {
    if (!this.state.connecting) {
      this.connect()
    }
  }

  componentWillUnmount() {
    if (this.peer) {
      this.peer.close()
    }
  }

  connect() {
    this.setState(state => ({ ...state, connecting: true }))
    const io = this.io = this.context.socket;

    io.emit('create or join room', { roomID: location.pathname });

    io.on('created room', (message) => {
      this.isHost = true;
      this.userId = message.userId;
      // wait for another user to connect
    });

    // if the room doesn't exist create it and wait for connections
    io.on('another user joined', (message) => {
      this.otherUser = message.guest;
      this.connectToUser(this.otherUser)
        .then((host) => {
          host.onnegotiationneeded = e =>
            host.createOffer()
              .then(tap(d => host.setLocalDescription(d)))
              .then(this.sendOffer)
              .then(({ answer }) => host.setRemoteDescription(answer));
        });
    });

    // if the room exists join it
    io.on('joined room', (message) => {
      this.userId = message.userId;
      this.otherUser = message.host;
      console.log('You are the slave awaiting connection from master', message);
    });

    io.on('offer', ({ offer }: { offer: RTCSessionDescription }) => {
      const slave = this.createSlaveConnection();
      slave.setRemoteDescription(offer)
        .then(() => {
          return slave.createAnswer()
            .then(async (answer: RTCSessionDescription) => {
              await slave.setLocalDescription(answer);
              return { answer };
            })
            .then(tap(this.sendAnswer));
        });
    });

    io.on('new-ice-candidate', async (message) => {
      console.log('new-ice-candidate', message);
      await this.peer.addIceCandidate(message.candidate);
    });
  }


  handleKeypress = e => {
    this.setState({ message: e.currentTarget.value });
  };

  send = e => {
    this.data.send(this.state.message);
    this.setState({ message: '' });
  };

  subscribers: any[] = [];

  sendMessage = (message) => {
    if (this.data) {
      this.data.send(message);
    }
  }

  subscribe = (fn) => {
    this.subscribers.push(fn);
  }

  unsubscribe = (fn) => {
    this.subscribers.push(fn);
    const index = this.subscribers.indexOf(fn);
    if (~index) {
      this.subscribers.splice(index, 1);
    }
  }

  value = () => ({
    peer: this.peer,
    sendMessage: message => this.sendMessage(message),
    subscribe: fn => this.subscribe(fn),
    unsubscribe: fn => this.unsubscribe(fn),
  })

  shouldComponentUpdate(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false
  }

  render = () => {
    return (
      <div>
        <WebRTCContext.Provider value={this.value()}>
          {this.props.children}
        </WebRTCContext.Provider>
      </div>
    );
  }

  _render() {
    return (
      <div>
        <input onChange={this.handleKeypress} value={this.state.message} type="text" />
        <Button onClick={this.send}>Send</Button>
      </div>
    );
  }

}
