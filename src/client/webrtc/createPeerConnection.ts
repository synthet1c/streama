import { Socket } from 'socket.io';

const iceConfiguration = {
  iceServers: [
    { urls: 'stun:stun.1.google.com:19302' },
  ],
};

export interface IPeerConnection {
  peer: RTCPeerConnection
  data: RTCDataChannel
}

export interface CreatePeerConnectionArgs {
  socket: Socket
  isMaster: boolean,
  credentials: any
}

export default function createPeerConnection({
  socket,
  isMaster = false,
  credentials,
 }: CreatePeerConnectionArgs): IPeerConnection {

  const peer = new RTCPeerConnection(iceConfiguration)
  let data = null

  if (isMaster) {
    data = peer.createDataChannel('chat')
  }

  peer.onicecandidate = e => {
    if (e.candidate) {
      socket.emit('new-ice-candidate', {
        candidate: e.candidate
      })
    }
  }
  return {
    peer,
    data,
  }
}
