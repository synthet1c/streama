export default class Communicate {

  socketConnected: boolean = false
  webrtcConnected: boolean = false

  socket = {
    connected: false,
    port: null
  }

  webrtc = {
    connected: false,
    port: null
  }

  // send as json
  public send(message) {
    // + parse message as binary
    // + connect to host either through socket or webrtc
    // + send info
  }

  connectSocket() {

  }

}
