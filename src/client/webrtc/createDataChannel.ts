export interface ICreateDataChannelEventsArgs {
  channel: RTCDataChannel,
  peer: RTCPeerConnection
}

export default function createDataChannelEvents({
  channel,
  peer,
}): RTCDataChannel {

  channel.onopen = () => {
    console.log('Data Channel open')
  }

  channel.onclose = () => {
    console.log('Data Channel closed')
  }

  channel.onmessage = (event: MessageEvent) => {
    console.log('Data channel message: ', event.data)
  }

  return channel
}
