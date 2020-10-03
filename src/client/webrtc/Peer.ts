import { UserID } from './types';
import DataChannel, { ChannelID } from './DataChannel';
import { IMessage, IMessageSubscription, IMessageSubscriptions } from './interfaces';
import { Socket } from 'socket.io';
import { trace } from '../../shared/trace';
import Buffer from 'buffer'
import DataMessage from '../utils/DataMessage';
import VideoMessage from '../utils/VideoMessage';

const tap = fn => x => (fn(x), x);

export default class Peer {
  isHost: boolean = false;
  connection: RTCPeerConnection;
  data: RTCDataChannel;
  id: UserID;
  userId: UserID;
  dataChannels: Map<ChannelID, DataChannel> = new Map;
  socket: Socket;
  // internet connection reliability
  reliabilityScore: number = 1
  // stream quality
  quality: 1080 | 720 | 420 | 'audio'

  private messageSubscriptions: IMessageSubscriptions[];


  static configuration = {
    iceServers: [
      { urls: 'stun:stun.1.google.com:19302' },
      // { urls: 'turn:127.0.0.1:3478' }
    ],
  };


  private constructor({ userId, peerId, socket }) {
    this.connection = new RTCPeerConnection(Peer.configuration);
    this.id = peerId;
    this.userId = userId;
    this.socket = socket;
  }


  public async init(res, rej) {
    this.connection.onicecandidate = this.handleOnIceCandidate;
    this.connection.onconnectionstatechange = (event: any) => {
      switch (event.currentTarget.connectionState) {
        case 'connected':
          return true
          // return res(this);
        case 'disconnected':
        case 'closed':
          return this.cleanup();
        case 'failed':
          return rej(this);
      }
    };
  }


  /**
   * Create a new peer connection as the host of the call
   *
   * @param userId
   * @param peerId
   * @param socket
   * @param messageCallback
   */
  static createPeer = ({ userId, peerId, socket, messageCallback }): Promise<Peer> => new Promise(async (res, rej) => {
    // initialize the peer
    const peer = new Peer({
      userId,
      peerId,
      socket,
    });
    await peer.init(res, rej);
    peer.data = peer.connection.createDataChannel('chat');
    peer.data.addEventListener('message', messageCallback)
    peer.data.addEventListener('open', peer.dataChannelOpen)

    socket.on('new-ice-candidate', async (message: IMessage) => {
      await peer.connection.addIceCandidate(message.payload.candidate);
    })

    peer.connection.onnegotiationneeded = async (e) => {
      await peer.connection.createOffer()
        .then(tap(d => peer.connection.setLocalDescription(d)))
        .then(peer.sendOffer)
        .then(({ answer }) => peer.connection.setRemoteDescription(answer))
        .then(() => res(peer))
        .catch(rej);
    };
  });

  /**
   * IMPORTANT!! This should only be called by receiving an offer through socket io
   *
   * @param userId
   * @param peerId
   * @param socket
   * @param offer
   * @param dataCallback
   */
  static createHostConnection = ({
    userId,
    peerId,
    socket,
    offer,
    dataCallback,
  }): Promise<Peer> => new Promise(async (res, rej) => {
    const peer = new Peer({
      userId,
      peerId,
      socket,
    });
    await peer.init(res, rej);
    peer.connection.ondatachannel = (event) => {
      peer.data = event.channel;
      peer.data.addEventListener('message', peer.onMessageCallback(dataCallback).bind(peer))
      peer.data.addEventListener('open', peer.dataChannelOpen)
      res(peer);
    };
    peer.connection.setRemoteDescription(offer)
      .then(() => {
        peer.connection.createAnswer()
          .then(async (answer: RTCSessionDescription) => {
            await peer.connection.setLocalDescription(answer);
            return { answer };
          })
          .then(tap(peer.sendAnswer));
      });

    socket.on('new-ice-candidate', async (message: IMessage) => {
      await peer.connection.addIceCandidate(message.payload.candidate);
    })
  });


  private onMessageCallback(nodeCallback) {
    return function(this: Peer, event: MessageEvent) {
      let message
      if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
        message = DataMessage.parseBuffer(event.data, VideoMessage)
      }
      // intercept the message
      if (this.messageSubscriptions && typeof this.messageSubscriptions[message.type] !== 'undefined') {
        // @ts-ignore
        this.messageSubscriptions[message.type].forEach(event => {
          event.callback(message);
        });
      } else {
        nodeCallback(event)
      }
    }
  }


  public handleOnIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      this.socket.emit('new-ice-candidate', {
        type: 'new-ice-candidate',
        origin: this.userId,
        target: this.id,
        from: this.userId,
        payload: {
          candidate: event.candidate
        },
        created: (new Date()).toISOString(),
        isPrivate: true,
      });
    }
  };


  private sendOffer = async (description: RTCSessionDescription): Promise<{ answer: RTCSessionDescription }> => new Promise((res, rej) => {
    this.socket.emit('offer:host', {
      type: 'offer:host',
      origin: this.userId,
      target: this.id,
      payload: {
        offer: description,
      },
    });
    this.socket.on('answer', (message: IMessage) => {
      res({ answer: message.payload.answer });
    });
  });


  private sendAnswer = async ({ answer }) => {
    await this.socket.emit('answer', {
      type: 'answer',
      origin: this.userId,
      target: this.id,
      payload: {
        answer,
      },
      created: (new Date()).toISOString(),
      isPrivate: true,
    });
  };


  private dataChannelOpen = e => {
    console.log('data channel open', e)
  }


  private cleanup() {
    for (const [channelId, dataChannel] of this.dataChannels.entries()) {
      this.dataChannels.delete(channelId);
    }
  }


  public async disconnect() {
    for (const [channelId, dataChannel] of this.dataChannels.entries()) {
      dataChannel.disconnect();
      this.dataChannels.delete(channelId);
    }
    this.connection.close();
  }


  public reliability = async (origin): Promise<Peer> => new Promise((res, rej) => {
    this.request({
      type: 'request:reliability',
      target: this.id,
      origin: origin.id,
      from: this.id,
      payload: {},
      created: (new Date()).toISOString(),
      isPrivate: true,
    }).then((response) => {
      this.reliabilityScore = response.payload.reliability
      this.quality = response.payload.quality
      res(this as Peer)
    })
  })


  public send(message: IMessage) {
    this.data.send(JSON.stringify(message));
  }

  public sendData(data: ArrayBuffer) {
    this.data.send(data)
  }


  /**
   * Subscribe to a network message or custom event
   * @param event
   * @param callback
   * @param source
   */
  private on = (event: string, callback: (message) => void | any, source?: string) => {
    if (!this.messageSubscriptions[event]) {
      this.messageSubscriptions[event] = {};
    }
    this.messageSubscriptions[event].push({ event, callback, source } as IMessageSubscription);
  };


  /**
   * Unsubscribe from an event
   * @param event
   * @param callback
   * @param source
   */
  private off = (event: string, callback: (event: MessageEvent) => void, source?: string) => {
    this.messageSubscriptions[event] = this.messageSubscriptions[event].filter(
      obj =>
        event === obj.event
        && (callback ? obj.callback === callback : true)
        && (source ? obj.source === source : true)
    );
  };



  /**
   * Request some information from the Peer
   * @param message
   */
  public request = (message: IMessage): Promise<IMessage> => new Promise((res) => {
    // send the message to the Peer
    this.data.send(JSON.stringify(message))
    const provideEventName = message.type.replace('request', 'provide')
    const callback = (event) => {
      // remove the event listener once the message has been received
      this.off(provideEventName, callback)
      const response: IMessage = JSON.parse(event.data)
      res(response)
    }
    // bind the callback to the response
    this.on(provideEventName, callback)
  })
}
