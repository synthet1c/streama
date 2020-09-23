```typescript

type UserID = string

class Peer {
  connection: RTCPeerConnection
  data: RTCDataChannel
}

class Node {
  isHost: boolean
  peers: Map<UserID, Peer>
  id: UserID
  socket: Socket

  constructor() {

  }

  public connectTo(UserID) {
    // * host add new Peer to peers
    // * create global data channel
  }
  public createDataChannel(UserID) {
    // * find peer in peers
    // * if peer doesn't exist connectTo peer
    // * create data channel if it doesn't exist
  }
  public closeDataChannel(UserID) {
    // * find peer in peers
    // * close channel unbind all events
  }

  private bindSocketEvents() {
    this.socket.on('hostChange', () => {})
  }

  private onHostChange(newHost) {
    // * onMessage to socket io event
  }

  private onGuestJoined() {

  }
}

```
