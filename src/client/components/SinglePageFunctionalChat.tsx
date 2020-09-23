import React, { Ref, useEffect, useRef, useState } from 'react';
import { Button } from '@material-ui/core';


const SinglePageFunctionalChat = () => {

  const pc1: Ref<RTCPeerConnection> = useRef(new RTCPeerConnection())
  const pc2: Ref<RTCPeerConnection> = useRef(new RTCPeerConnection())

  let dc1 = useRef(null)
  let dc2 = useRef(null)

  const chat: Ref<HTMLInputElement> = useRef(null)

  const [message, setMessage] = useState('hello')

  useEffect(() => {

    pc1.current.onicecandidate = e => pc2.current.addIceCandidate(e.candidate);
    pc2.current.onicecandidate = e => pc1.current.addIceCandidate(e.candidate);
    pc1.current.oniceconnectionstatechange = e => console.log(pc1.current.iceConnectionState);

    pc1.current.onnegotiationneeded = e =>
      pc1.current.createOffer().then(d => pc1.current.setLocalDescription(d))
        .then(() => pc2.current.setRemoteDescription(pc1.current.localDescription))
        .then(() => pc2.current.createAnswer()).then(d => pc2.current.setLocalDescription(d))
        .then(() => pc1.current.setRemoteDescription(pc2.current.localDescription))
        .catch(e => console.log(e));

    pc2.current.ondatachannel = e => {
      dc2.current = e.channel;
      dc2.current.onopen = () => console.log("Chat!");
      dc2.current.onmessage = e => console.log("> " + e.data);
    };

    dc1.current = pc1.current.createDataChannel("chat");
    dc1.current.onopen = () => (console.log('DC1 onopen'));
  })

  const send = e => {
    dc1.current.send(message);
    setMessage('')
  };

  return (
    <div>
      <input ref={chat} onChange={e => setMessage(e.currentTarget.value)} value={message} type="text" />
      <Button onClick={send}>Send</Button>
    </div>
  )

}

export default SinglePageFunctionalChat
