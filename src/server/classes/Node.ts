import { Socket, Server } from 'socket.io';
import { Stream } from 'stream';
import { trace } from '../../shared/trace';

type SessionID = string

const peek = (tag: string) => (fn) => (x: any) => {
  const result = fn(x)
  console.log('peek', tag, x, result)
  return result
}

let rooms = {}

class Room {

  io: Server
  roomID: string
  host: string
  members: string[] = []
  guests: string[] = []

  constructor(io, roomID, host) {
    this.io = io
    this.roomID = roomID
    this.host = host
    this.members.push(host)
    this.messageHost('created room', {
      userId: host,
      isHost: true
    })
  }

  messageHost(message, data) {
    this.io.to(this.host).emit(message, data)
  }


  addGuest(guest) {
    if (~this.members.indexOf(guest)) {
      this.members.push(guest)
    }
    if (~this.guests.indexOf(guest)) {
      this.guests.push(guest)
    }
    this.io.to(guest).emit('joined room', {
      userId: guest,
      host: this.host
    })
    this.io.to(this.host).emit('another user joined', {
      guest: guest
    })
  }

  removeUser(user) {
    if (this.host === user) {
      // reset the host
      const newHost = this.members.find(x => x !== user)
      if (!newHost) {
        this.closeRoom()
      }
      this.host = newHost
    }
    this.members.splice(this.members.indexOf(user), 1)
    if (~this.guests.indexOf(user)) {
      this.guests.splice(this.guests.indexOf(user), 1)
    }
  }

  closeRoom() {
    delete rooms[this.roomID]
  }
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

  public isRoomHost: boolean = false

  public health: number;
  public parent: Node;
  public backup: Node;

  private timer: any;
  private total: number;

  private _stream: Stream;
  private _connection: any;

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

    this.total = 1;
    // this.timedMessage()
  }

  public timedMessage = () => {
    this.onMessage({ content: 'interval' });
    if (this.total++ < 20) {
      this.timer = setTimeout(this.timedMessage, 1000 + Math.random() * 5000);
    }
  };

  public initSocketMessages() {
    this.socket.on('message', this.onMessage);
    this.socket.on('healthCheck', this.onHealthCheck);

    const socket = this.socket
    const io = this.io

    socket.on('create or join room', ({ roomID }) => {
      let room = rooms[roomID]
      if (!room) {
        room = rooms[roomID] = new Room(io, roomID, socket.id)
        console.log('created room', room)
      } else {
        room.addGuest(socket.id)
        console.log('added guest', room)
      }
    })

    socket.on("offer", payload => {
      console.log('offer', payload, rooms)
      io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
      console.log('answer', payload, rooms)
      io.to(payload.target).emit("answer", payload);
    });

    socket.on("new-ice-candidate", payload => {
      console.log('new-ice-candidate', payload, rooms)
      io.to(payload.target).emit("new-ice-candidate", payload);
    });

    socket.on('disconnect', () => {
      Object.keys(rooms).forEach(roomID => {
        console.log('destroy room', rooms[roomID])
        rooms[roomID].removeUser(socket.id)
        console.log('destroyed room', roomID, rooms)
      }, {})
    })

  }

  public handleJoinRoom = (info) => {
    if (!this.socket.adapter.rooms[info.room]) {
      this.isRoomHost = true
    }
    this.socket.join(info.room)
    this.socket.emit('room-joined', {
      ...info,
      isRoomHost: this.isRoomHost
    })
  }

  public handleOffer = offer => {
    this.socket.join(offer.room)
    this.socket.broadcast.emit('offer', offer)
  };

  public handleAnswer = answer => {
    if (!this.socket.adapter.rooms[answer.room]) {
      this.isRoomHost = true
    }
    this.socket.join(answer.room)
    this.socket.broadcast.emit('answer', answer)
  };

  public handleIceCandidate = candidate => {
    if (!this.socket.adapter.rooms[candidate.room]) {
      this.isRoomHost = true
    }
    this.socket.join(candidate.room)
    this.socket.broadcast.emit('new-ice-candidate', candidate)
  }

  public onMessage = (message) => {
    console.log('Node:message', message);
    this.io.sockets.emit('message', {
      id: (Date.now()).toString(16) + '-' + Math.floor(Math.random() * 500) + '-' + this.total,
      createdAt: Date.now(),
      content: 'What chu sa to me, huh? ' + this.total,
      title: 'Reply',
      user: 'AYO',
    });
  };

  public onHealthCheck = ({ message }) => {
    console.log('Node:healthCheck', message);
  };

  // public get parent() {
  //   return Node.parent(this)
  // }
  //
  // public set parent(parent: Node) {
  //   Node._parents.set(this, parent)
  // }

  public static parent(node) {
    return Node.parents.get(node);
  }

  // General Health Check of network conditions

  // Connect to Server

  // get assigned to Cluster

  // Sort health against siblings

  public async send(event: string, value?: any): Promise<any> {
    return this._connection.send(event, value);
  }

  public async stream(stream: Stream): Promise<Stream> {
    // @ts-ignore
    return this.stream.pipe(stream);
  }

  public getHealth(): any {
    throw new Error('Method not implemented.');
  }

  static getBySessionId(sessionId: SessionID) {
    return Node.nodes.get(sessionId);
  }

}
