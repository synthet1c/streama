import { Socket, Server } from 'socket.io';
import { Stream } from 'stream';

type SessionID = string

export default class Node {

  ['constructor']: Node;

  // Current nodes parent
  static parents: Map<Node, Node> = new Map;

  // all Nodes in the Server
  static nodes: Map<SessionID, Node> = new Map;

  public ip: string;
  public sessionId: string;
  private socket: Socket;
  private io: Server

  public health: number;
  public parent: Node;
  public backup: Node;

  private timer: any
  private total: number

  private _stream: Stream;
  private _connection: any;

  public constructor({
     sessionId,
     socket,
     io,
   }) {
    this.sessionId = sessionId;
    this.socket = socket;
    this.io = io
    Node.nodes.set(sessionId, this);
    this.initSocketMessages();

    this.total = 1
    this.timedMessage()

  }

  public timedMessage = () => {
    this.onMessage({ content: 'interval' })
    if (this.total++ < 20) {
      this.timer = setTimeout(this.timedMessage, 1000 + Math.random() * 5000)
    }
  }

  public initSocketMessages() {
    this.socket.on('message', this.onMessage);
    this.socket.on('healthCheck', this.onHealthCheck);
  }

  public onMessage = (message) => {
    console.log('Node:message', message);
    this.io.sockets.emit('message', {
      id: (Date.now()).toString(16) + '-' + Math.floor(Math.random() * 500) + '-' + this.total,
      createdAt: Date.now(),
      content: 'What chu sa to me, huh? ' + this.total,
      title: 'Reply',
      user: 'AYO'
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
