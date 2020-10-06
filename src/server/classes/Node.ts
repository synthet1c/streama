import { Socket, Server } from 'socket.io';
import Room from './Room'

type SessionID = string
type UserID = string

export interface IMessage {
  type: string
  origin: UserID
  target: UserID
  from: UserID
  payload: any
  created: string
  isPrivate: boolean
}


export default class Node {

  ['constructor']: Node;

  // Current nodes parent
  static parents: Map<Node, Node> = new Map;

  // all Nodes in the Server
  static nodes: Map<SessionID, Node> = new Map;

  public ip: string;
  public sessionId: string;
  private socket: Socket;
  private io: Server;

  public isRoomHost: boolean = false;
  private room: Room

  public health: number;

  public constructor({
    sessionId,
    socket,
    io,
    req,
    res,
  }) {
    this.sessionId = sessionId;
    this.socket = socket;
    this.io = io;
    Node.nodes.set(sessionId, this);
    this.initSocketMessages();
  }

  public initSocketMessages() {
    this.socket.on('message', this.onMessage);
    this.socket.on('healthCheck', this.onHealthCheck);

    const socket = this.socket;
    const io = this.io;

    socket.on('createOrJoinRoom', ({ payload }: IMessage) => {
      this.room = Room.createOrJoinRoom({
        io,
        roomID: payload.roomID,
        host: socket.id,
        socket
      })
    });

    // Handle webRTC offer
    socket.on('offer', payload => {
      io.to(payload.target).emit('offer', payload);
    });

    socket.on('offer:host', payload => {
      io.to(payload.target).emit('offer:host', payload);
    });

    socket.on('answer', payload => {
      io.to(payload.target).emit('answer', payload);
    });

    socket.on('new-ice-candidate', payload => {
      io.to(payload.target).emit('new-ice-candidate', payload);
    });

    socket.on('disconnect', () => {
      if (this.room) {
        this.room.disconnect(this.socket.id)
      }
    });

  }

  public onMessage = (message) => {
    console.log('Node:message', message);
    this.io.sockets.emit('message', {
      id: (Date.now()).toString(16) + '-' + Math.floor(Math.random() * 500),
      createdAt: Date.now(),
      content: 'What chu sa to me, huh?',
      title: 'Reply',
      user: 'AYO',
    });
  };

  public onHealthCheck = ({ message }) => {
    console.log('Node:healthCheck', message);
  };

  public static parent(node) {
    return Node.parents.get(node);
  }

  // General Health Check of network conditions

  // Connect to Server

  // get assigned to Cluster

  // Sort health against siblings

  public getHealth(): any {
    throw new Error('Method not implemented.');
  }

  static getBySessionId(sessionId: SessionID) {
    return Node.nodes.get(sessionId);
  }

}
