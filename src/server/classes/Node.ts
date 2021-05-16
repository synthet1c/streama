import { Socket, Server } from 'socket.io';
import Room from './Room';
import { IHeapable } from '../datastructures/heap';
import FrameMessage from '../messages/FrameMessage';
import Channel from './Channel';
import path from 'path';
import { Writable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

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


export default class Node implements IHeapable {

  // all Nodes in the Server
  static nodes: Map<SessionID, Node> = new Map;

  public ip: string;
  public sessionId: string;
  private socket: Socket;
  private io: Server;
  public readonly id: string;
  public score: number;
  public region: string;

  public isRoomHost: boolean = false;
  private room: Room;

  public health: number;

  public constructor({
    sessionId,
    socket,
    io,
    req,
    res,
  }) {
    this.id = socket.id;
    this.sessionId = sessionId;
    this.socket = socket;
    this.io = io;
    Node.nodes.set(this.id, this);
    this.initSocketMessages();
    this.region = 'w';
  }

  static getNode(sessionID: SessionID): Node {
    return Node.nodes.get(sessionID);
  }

  private initSocketMessages() {
    this.socket.on('message', this.onMessage);
    this.socket.on('healthCheck', this.onHealthCheck);

    const socket = this.socket;
    const io = this.io;

    socket.on('createOrJoinRoom', async ({ payload }: IMessage) => {

      ffmpeg.ffprobe(path.resolve(process.cwd(), './assets/this_one.mp4'), (err, metadata) => {
        console.log('probe', metadata);
        let index = 0;
        let bytes = 0;
        // fs.createReadStream(path.resolve(process.cwd(), './assets/this_one.mp4'))
          ffmpeg(path.join(process.cwd(), './assets/frag_bunny.mp4'), {
            logger: 'debug'
          })
          .videoCodec('libx264')
          .withAudioCodec('aac')
          .outputFormat('mp4')
          // https://stackoverflow.com/questions/31834456/how-to-use-ffmpeg-for-streaming-mp4-via-websocket
          .outputOptions([
            // '-c:v copy',
            // '-c:a copy',
            // '-g 59', // 59 frames per fragment
            '-segment_time 10',
            '-reset_timestamps 1',
            '-movflags ' + [
              'empty_moov',
              'frag_keyframe',
              'omit_tfhd_offset',
              'default_base_moof'
            ].join('+'),
          ])
          .pipe(new Writable({
            // objectMode: true,
            write: (chunk, encoding, callback) => {
              console.log('chunk', chunk.byteLength, chunk)
              const data = new FrameMessage({
                type: 'data:stream',
                from: 'server',
                origin: 'server',
                target: '',
                index: index += 1,
                startByte: bytes,
                endByte: (bytes += chunk.byteLength),
                timeStart: 0,
                timeEnd: 0,
                data: chunk,
                created: new Date(),
              }).getBuffer();
              this.sendData('data', data);
              callback();
            },
          }));
      });


      // const channel = await Channel.getChannel(payload.roomID)
      // const channel = await Channel.getChannel('foonta');
      // channel.addViewer(this);

      /*
      this.room = Room.createOrJoinRoom({
        io,
        roomID: payload.roomID,
        host: socket.id,
        socket
      })
      */
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
        this.room.disconnect(this.socket.id);
      }
    });

  }

  private onMessage = (message) => {
    console.log('Node:message', message);
    this.io.sockets.emit('message', {
      id: (Date.now()).toString(16) + '-' + Math.floor(Math.random() * 500),
      createdAt: Date.now(),
      content: 'What chu sa to me, huh?',
      title: 'Reply',
      user: 'AYO',
    });
  };

  private onHealthCheck = ({ message }) => {
    console.log('Node:healthCheck', message);
  };

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

  public sendMessage(message: IMessage) {
    this.socket.emit('message', message);
  }

  public sendData(key: string, message: Buffer) {
    this.socket.emit(key, message);
  }

  [Symbol.toPrimitive](): number {
    return this.score;
  }

  valueOf(): number {
    return this.score;
  }

}
