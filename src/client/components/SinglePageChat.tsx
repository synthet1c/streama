import React, { Component, createRef, Ref, useRef } from 'react';
import { Button } from '@material-ui/core';

export default class SinglePageChat extends Component {

  private pc1: RTCPeerConnection
  private pc2: RTCPeerConnection

  private dc1: RTCDataChannel
  private dc2: RTCDataChannel

  private configuration = {
    iceServers: [
      { urls: 'stun:stun.1.google.com:19302' },
    ],
  };


  state = {
    message: 'message yo'
  }

  componentDidMount() {

    this.pc1 = new RTCPeerConnection(this.configuration)
    this.pc2 = new RTCPeerConnection(this.configuration)

    this.pc1.onicecandidate = e => this.pc2.addIceCandidate(e.candidate);
    this.pc2.onicecandidate = e => this.pc1.addIceCandidate(e.candidate);
    this.pc1.oniceconnectionstatechange = e => console.log(this.pc1.iceConnectionState);

    this.pc1.onnegotiationneeded = e =>
      this.pc1.createOffer().then(d => this.pc1.setLocalDescription(d))
        .then(() => this.pc2.setRemoteDescription(this.pc1.localDescription))
        .then(() => this.pc2.createAnswer()).then(d => this.pc2.setLocalDescription(d))
        .then(() => this.pc1.setRemoteDescription(this.pc2.localDescription))
        .then(() => { console.log('connected') })
        .catch(e => console.log(e));

    this.pc2.ondatachannel = e => {
      console.log('ondatachannel triggered')
      this.dc2 = e.channel;
      this.dc2.onopen = () => console.log("Chat!");
      this.dc2.onmessage = e => console.log("> " + e.data);
    };

    this.dc1 = this.pc1.createDataChannel("chat");
    console.log('datachannel created')
    this.dc1.onopen = () => (console.log('DC1 onopen'));
    this.dc1.onmessage = e => console.log("< " + e.data);
  }


  handleKeypress = e => {
    this.setState({ message: e.currentTarget.value })
  }

  send1 = e => {
    this.dc1.send(this.state.message);
    this.setState({ message: '' })
  }

  send2 = e => {
    this.dc2.send(this.state.message);
    this.setState({ message: '' })
  }

  render() {
    return (
      <div>
        <input onChange={this.handleKeypress} value={this.state.message} type="text" />
        <Button onClick={this.send1}>Send 1</Button>
        <Button onClick={this.send2}>Send 2</Button>
      </div>
    )
  }
}
