import { Socket } from 'socket.io';
import { UserID } from './types';
// import DataChannel, { ChannelID } from './DataChannel';
import {
  ConnectionInfo,
  IMessage,
  IMessagePartial,
  IMessageSubscription,
  IMessageSubscriptions,
} from './interfaces';
import Peer from './Peer';
import Member from './Member';
import { IMessenger, messenger, onMessage, Subscription } from './decorators/messenger';

export interface ICreateNodeParams {
  socket: Socket
}

@messenger
export default class Node {

  isHost: boolean;

  /* host who is streaming data to you */
  host: Peer;

  /* is the current node connected to the network */
  connected: boolean = false;

  /* backup host (sibling of host) */
  backup: Peer;

  /* peers you have direct connection to */
  peers: Map<UserID, Peer> = new Map;

  /* members in the current room */
  members: Map<UserID, Member> = new Map;

  /* data channels that are currently open from this connection */
  // dataChannels: Map<ChannelID, DataChannel> = new Map;

  /* data channels for each user */
  // userDataChannels: Map<UserID, ChannelID> = new Map;

  /* your user id (matches Socket.ID) */
  id: UserID;

  /* your open socket to the server */
  socket: Socket;


  messageSubscriptions: IMessageSubscriptions[];

  /* internet connection reliability */
  reliabilityScore: number = 1;

  /* stream quality */
  quality: 1080 | 720 | 420 | 'audio';

  // methods from IMessenger
  // decorate: () => void;
  // trigger: (this: any, name: string, message: IMessage) => void;
  on: (event: string, callback: (message) => void| any, source?: string) => void
  off: (event: string, callback: () => void | any, source?: string) => void

  trigger(this: any, name: string, message: IMessage) {
    const subscriptions: Subscription[] = this.messageSubscriptions[name] || [];
    // boot the subscriptions
    return subscriptions.map(({ propertyKey, name, callback }) => {
      return callback(message);
    });
  }

  /**
   * !!! IMPORTANT !!! Do not use constructor, use Node.create as it's asynchronous
   *
   * @param {SocketIO.Socket} socket
   * @private
   */
  constructor({ socket }: ICreateNodeParams) {
    this.socket = socket;
  }


  /**
   * @param {ICreateNodeParams} params
   * @returns {Promise<Node>}
   */
  public static create = (params: ICreateNodeParams): Node => {
    // initialize socket
    // wait for communication from server
    // create peer connections
    const node = new Node(params);
    // pass the resolve function that will fire when the server has joined the Node to a room
    // await node.bindSocketEvents(res);

    return node
  };

  public init = async () => new Promise((res, rej) => {
    this.bindSocketEvents(res)
  })

  public disconnect = () => {
    console.log('disconnect from server')
  }

  public subscribe = (fn) => this.on('message', fn)
  public unsubscribe = (fn) => this.off('message', fn)
  public sendMessage = (message) => this.send('message', null, {
    type: 'message',
    payload: {
      message
    }
  })


  private bindSocketEvents(res) {
    this.socket.emit('createOrJoinRoom', this.createMessage({
      type: 'createOrJoinRoom',
      payload: {
        roomID: location.pathname,
      },
    }));
    this.socket.on('createRoom', async (message: IMessage) => {
      await this.handleCreateRoom(message);
      this.connected = true
      // resolve Node.create as the user has successfully joined the network
      res(this);
    });
    this.socket.on('joinRoom', async (message: IMessage) => {
      await this.handleJoinRoom(message);
      // resolve Node.create as client is connected to the hast
      this.connected = true
      res(this);
    });
    this.socket.on('setAsHost', this.handleSetAsHost);
    this.socket.on('hostChange', this.handleHostChange);
    this.socket.on('addPeer', this.handleAddPeer);
    this.socket.on('offer:host', this.handleReceiveHostOffer);
    this.socket.on('offer:peer', this.handleReceivePeerOffer);

    this.socket.on('stream', console.log.bind('stream'))
  }


  /**
   * Data channel can be to the host or to an individual user in a PM for security
   *
   * @param userId  user id to connect data channel to
   */
  // public async createDataChannel(userId: UserID): Promise<DataChannel> {
  //   // * find peer in peers
  //   const peer = await this.getPeer(userId);

  //   const dataChannel = await DataChannel.create({
  //     peer,
  //     userId,
  //     name: 'global',
  //   });
  //   this.dataChannels.set(dataChannel.id, dataChannel);
  //   // * create data channel if it doesn't exist
  //   return dataChannel;
  // }


  public closeDataChannel(UserID) {
    // * find peer in peers
    // * close channel unbind all events
  }


  /**
   * Ensure that all messages have the same shape
   * @param message
   */
  private createMessage = (message: IMessagePartial): IMessage => ({
    ...({
      type: name,
      target: null,
      origin: this.id,
      from: this.id,
      payload: null,
      created: (new Date()).toISOString(),
      isPrivate: false,
    }),
    ...message,
  });


  /**
   * Send a message to another node use either
   * @param name
   * @param target
   * @param payload
   * @param isPrivate
   */
  public send = async (name: string, target: UserID | null, payload: IMessagePartial, isPrivate?: boolean) => {
    const message: IMessage = this.createMessage({
      type: name,
      target,
      ...payload,
      ...(isPrivate && { isPrivate: true }),
    });
    if (message.target === message.from) {
      return
    }
    if (!this.connected) {
      // send message using Server SocketIO
      this.socket.emit('message', message);
    } else if (isPrivate) {
      // send message using WebRTC to an already established peer
      const peer = await this.getPeer(target);
      peer.send(message);
    } else {
      // send message through host network
      await this.broadcast(message);
    }
  };


  /**
   * Send a message to another node use either
   * @param message
   * @param isPrivate
   */
  private broadcast = async (message: IMessage, isPrivate?: boolean) => {
    // have the host send the message down the tree
    if (message.target === this.id) {
      return
    }
    if (this.isHost) {
      for (const [peerId, peer] of this.peers.entries()) {
        // skip broadcasting back to the node that sent us the message
        if (message.from === peerId) continue;
        // if this is a targeted message only send to the target or child hosts
        if (message.target && !(peerId === message.target || peer.isHost)) continue;
        peer.send({
          ...message,
          ...(isPrivate && { isPrivate: true }),
          from: this.id,
        });
      }
    }
    // send the signal up the tree
    if (this.host) {
      this.host.send({
        ...message,
        ...(isPrivate && { isPrivate: true }),
        from: this.id,
      });
    } else {
      // send message to server to be saved to database
    }
  };



  /**
   * Trigger an event with a payload
   *
   * @param event
   * @param payload
   * @param source
   */
  private onTrigger = (event: string, payload: any, source?: string) => {
    const value = this.createMessage({
      type: event,
      target: null,
      payload,
    });
    if (!this.messageSubscriptions[event]) return false;
    this.messageSubscriptions[event].forEach(event => {
      event.callback(value);
    });
  };



  /**
   * This should be passed to any DataStreams to intercept their events
   * @param event
   */
  private messageCallback = (event: MessageEvent) => {
    const message: IMessage = JSON.parse(event.data);
    console.log('message', message)
    // trigger any message subscriptions
    this.trigger(message.type, message);
    // send the message to all child nodes
    if (message.target !== this.id) {
      if (this.isHost) {
        this.broadcast(message);
      } else {
        this.send(message.type, message.target, message,true)
      }
    }
  };


  private initializeMessageListeners = () => {
    // intercept all server messages
    this.host.data.addEventListener('message', this.messageCallback);
    // intercept all WebRTC network messages
    this.socket.on('message', (message: IMessage) => {
      this.trigger(message.type, message)
    });
  };

  @onMessage('request:backupHost')
  protected requestBackupHost(message: IMessage) {
    this.send('provide:backupHost', message.origin, this.createMessage({
      ...message,
      type: 'provide:backupHost',
      target: message.origin,
      payload: {
        backupId: this.id
      },
    }), true);
  }



  @onMessage('provide:backupHost')
  protected async provideBackupHost(message: IMessage) {
    console.log('provideBackupHost', message)
    // this.backup = await this.getPeer(message.payload.backupId, false);
  }


  /**
   * Request a backup sibling
   * @param message
   */
  @onMessage('request:backupSibling')
  protected async requestBackupSibling(message: IMessage) {
    // get the best connected user excluding the `from` node
    const peers = await this.getPeersByConnectionInfo();
    const strongestConnection = peers.find(peer => peer.id !== message.from);
    // send the id back to the node that requested the information
    this.send('provide:backupSibling', message.from, this.createMessage({
      ...message,
      type: 'provide:backupSibling',
      target: message.from,
      payload: {
        // peers are order by signal reliability score, get the first one that is not the message.from requester
        backupId: strongestConnection.id,
      },
    }), true);
  };


  @onMessage('provide:backupSibling')
  protected provideBackupSibling(message: IMessage) {
    this.send('provide:backupHost', message.origin, this.createMessage({
      ...message,
      type: 'provide:backupHost',
      target: message.origin,
    }), true);
  }


  @onMessage('request:reliability')
  protected requestReliability(message: IMessage) {
    this.send('provide:reliability', message.origin, this.createMessage({
      ...message,
      type: 'provide:reliability',
      target: message.origin,
      payload: {
        reliability: this.reliabilityScore,
        quality: this.quality,
        isHost: this.isHost,
      } as ConnectionInfo,
    }), true);
  }


  /**
   * Offer from a host, create a host connection that will provide the stream data
   * @param message
   */
  private handleReceiveHostOffer = async (message: IMessage) => {
    this.host = await Peer.createHostConnection({
      userId: this.id,
      peerId: message.origin,
      socket: this.socket,
      offer: message.payload.offer,
      dataCallback: this.messageCallback,
    })

    console.log('Node', this)

    /**
    this.host.send(this.createMessage({
      type: 'request:backupHost',
      target: this.host.id,
      isPrivate: true,
    }));
    */

    this.host.send(this.createMessage({
      type: 'hello',
      target: this.host.id,
      payload: {
        message: 'Hello!'
      },
      isPrivate: true,
    }));

    this.host.send(this.createMessage({
      type: 'request:video',
      target: this.host.id,
      payload: {
        message: 'Gimme da video!'
      },
      isPrivate: true,
    }));
  };


  /**
   * A peer could connect for backup or a private message
   * @param message
   */
  private handleReceivePeerOffer = async (message: IMessage) => {
    const peer = await Peer.createHostConnection({
      userId: this.id,
      peerId: message.payload.peerId,
      socket: this.socket,
      offer: message.payload.offer,
      dataCallback: this.messageCallback,
    });
    this.peers.set(message.payload.peerId, peer);
    return peer;
  };


  /**
   * User is at the root of the tree wait for connections
   * @param message
   */
  private handleCreateRoom = async (message: IMessage) => {
    // connect to the server and start downloading the stream
    this.id = message.payload.userId
    this.isHost = true
    console.log('%c You are the host: ', 'background:#ff2b97;color:white;', this.id)
  };

  /**
   * User is joining an established room, wait for the host to open a connection
   * @param message
   */
  private handleJoinRoom = async (message: IMessage) => {
    this.id = message.payload.userId
    this.isHost = false
    console.log('%c You are a guest: ', 'background:#ff2b97;color:white;', this.id)
  };

  /**
   * Host is disconnecting switch to backup while another is allocated
   * @param message
   */
  private handleHostChange = (message: IMessage) => {
    console.log('handleHostChange', message)
    console.log('%c You are now the host: ', 'background:#ff2b97;color:white;', this.id)
    if (message.payload.isHost) {
    }
  };


  private handleSetAsHost = (message: IMessage) => {
    console.log('handleSetAsHost', message)
    console.log('You are now the host: ', this.id)
    if (message.payload.isHost) {
      this.isHost = true
      this.host = null
    }
  };


  private handleAddPeer = async (message: IMessage) => {
    console.log('addPeer', message)
    if (this.isHost && message.target === this.id) {
      // establish a new connection
      await this.getPeer(message.payload.guest);
    } else {
      // add a new member, no need to create a connection as the host will do it
      if (!this.members.has(message.payload.guest)) {
        this.members.set(message.payload.guest, new Member(message.payload.guest));
      }
    }
  };


  /**
   * Request child peers connection information
   * @private
   */
  private getPeersByConnectionInfo(): Promise<Peer[]> {
    return Promise.all([...this.peers.values()]
      .map(peer => peer.reliability(this)),
    ).then(peers =>
      peers.sort((a, b) => b.reliabilityScore - a.reliabilityScore));
  }


  private async getPeer(peerId: UserID, addPeer: boolean = true) {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId);
    } else {
      const peer = await Peer.createPeer({
        userId: this.id,
        peerId,
        socket: this.socket,
        messageCallback: this.messageCallback,
      });
      if (addPeer) {
        this.peers.set(peerId, peer);
      }
      return peer;
    }
  }


  private async setHost(userId: UserID) {
    if (this.id == userId) {
      // no need to do anything
      return;
    }
    // disconnect from old Host
    const oldHost = this.host

    // promote the backup to the new host
    this.host = await this.getPeer(userId)
    this.host.data.addEventListener('message', this.messageCallback);

    if (oldHost) {
      oldHost.disconnect();
      oldHost.data.removeEventListener('message', this.messageCallback);
    }

  }
}
