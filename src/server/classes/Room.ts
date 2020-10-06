import { Server, Socket } from 'socket.io';
import basicStreamVideo from '../streams/read/basicStreamFile';
import { IMessage } from './Node';

export default class Room {

  io: Server;
  roomID: string;
  host: string;
  members: string[] = [];
  guests: string[] = [];
  socket: Socket;

  static rooms = {}

  constructor({ io, roomID, host, socket }) {
    this.io = io;
    this.socket = socket;
    this.roomID = roomID;
    this.host = host;
    this.members.push(host);

    this.messageHost({
      type: 'createRoom',
      origin: 'server',
      target: host,
      from: 'server',
      isPrivate: true,
      created: (new Date()).toISOString(),
      payload: {
        isHost: true,
        userId: host,
      },
    });
    this.streamVideo();
  }

  public streamVideo() {
    var filename = './assets/frag_bunny.mp4';

    basicStreamVideo({
      filename,
      socket: this.socket
    })

  }

  messageHost(message: IMessage) {
    this.io.to(this.host).emit(message.type, message);
  }

  addGuest(guest) {
    if (!~this.members.indexOf(guest)) {
      this.members.push(guest);
    }
    if (!~this.guests.indexOf(guest)) {
      this.guests.push(guest);
    }

    this.io.to(guest).emit('joinRoom', {
      type: 'joinRoom',
      origin: 'server',
      target: guest,
      from: 'server',
      isPrivate: true,
      created: (new Date()).toISOString(),
      payload: {
        isHost: false,
        userId: guest,
        host: this.host,
      },
    });

    this.io.to(this.host).emit('addPeer', {
      type: 'addPeer',
      origin: 'server',
      target: this.host,
      from: 'server',
      isPrivate: true,
      created: (new Date()).toISOString(),
      payload: {
        guest: guest,
      },
    });
  }


  removeUser(user): string[] {
    const actions = [];
    if (this.host === user) {
      // reset the host
      const newHost = this.members.find(x => x !== user);
      if (!newHost) {
        this.closeRoom();
        actions.push('destroyed room');
        return actions;
      }
      this.host = newHost;
      this.io.to(this.host).emit('setAsHost', {
        type: 'setAsHost',
        origin: 'server',
        target: this.host,
        from: 'server',
        isPrivate: true,
        created: (new Date()).toISOString(),
        payload: {
          isHost: true,
        },
      });
      this.io.emit('hostChange', {
        type: 'hostChange',
        origin: 'server',
        target: null,
        from: 'server',
        isPrivate: false,
        created: (new Date()).toISOString(),
        payload: {
          host: this.host,
        },
      });
      this.streamVideo();
      if (~this.guests.indexOf(this.host)) {
        this.guests.splice(this.guests.indexOf(this.host), 1);
      }
      actions.push(`set new host ${newHost}`);
    }

    if (~this.members.indexOf(user)) {
      this.members.splice(this.members.indexOf(user), 1);
      actions.push(`removed member: ${user}`);
      return actions;
    }
    if (~this.guests.indexOf(user)) {
      this.guests.splice(this.guests.indexOf(user), 1);
      actions.push(`removed guest: ${user}`);
      return actions;
    }
    actions.push(`did nothing`);
    return actions;
  }

  static createOrJoinRoom({ io, roomID, host, socket }) {
    let room = Room.rooms[roomID];
    if (!room) {
      room = Room.rooms[roomID] = new Room({
        io,
        roomID,
        host,
        socket,
      });
      console.log('created room', socket.id, room);
    } else {
      room.addGuest(socket.id);
      console.log('added guest', socket.id, room);
    }
    return room
  }

  static getRoom(roomID) {
    return Room.rooms[roomID]
  }

  disconnect(id) {
    Object.keys(Room.rooms).forEach(roomID => {
      console.log('remove user', id, Room.rooms[roomID]);
      const action = Room.getRoom(roomID).removeUser(id);
      console.log(action, id, roomID, Room.rooms);
    }, {});
  }

  closeRoom() {
    delete Room.rooms[this.roomID];
  }
}
