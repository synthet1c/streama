import { Request } from 'express'
import { Socket } from 'socket.io';

interface iClientArgs {
  id: string
  socket: Socket
}

export default class Client {

  ['constructor'] = Client
  static cache: Map<string, Client> = new Map
  id: string
  socket: Socket
  sessionId: string
  socketId: string
  active: boolean


  constructor({ id, socket }: iClientArgs) {
    this.sessionId = id
    this.socketId = socket.id
    this.socket = socket
    this.active = true
    Client.cache.set(this.socketId, this)
  }


  disconnect() {
    Client.cache.delete(this.sessionId)
  }


  static getBySessionId(sessionId: string): Client {
    return Client.cache.get(sessionId)
  }
}
