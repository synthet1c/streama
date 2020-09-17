import React, { Component, RefObject, createRef } from 'react';
import CardContent from '@material-ui/core/CardContent';
import { tapAsync } from '../../shared/tapAsync'


export default class VideoStream extends Component {

  localVideo: RefObject<HTMLVideoElement>;
  remoteVideo: RefObject<HTMLVideoElement>;

  mediaStreamConstraints: MediaStreamConstraints = {
    video: true,
  };

  servers: any = {};

  offerOptions: RTCOfferOptions = {
    offerToReceiveVideo: true,
  };

  localStream: MediaStream;
  remoteStream: MediaStream;
  localPeerConnection: RTCPeerConnection;
  remotePeerConnection: RTCPeerConnection;

  constructor(props) {
    super(props);
    this.localVideo = createRef();
    this.remoteVideo = createRef();
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
      .then(tapAsync(this.gotLocalMediaStream))
      .catch(this.handleLocalMediaStreamError);


    this.initRTCConnection();
  }

  initRTCConnection = () => {
    this.localPeerConnection = new RTCPeerConnection(this.servers);
    this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
    this.localPeerConnection.addEventListener('iceconnectionstatechange', this.handleConnectionChange);
  };

  gotLocalMediaStream = async (mediaStream: MediaStream) => {
    this.localStream = mediaStream;
    this.localVideo.current.srcObject = mediaStream;
  };

  handleLocalMediaStreamError = (error: Error) => {
    console.error('handleLocalMediaStreamError', error);
  };

  handleConnection = (event) => {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      otherPeer.addIceCandidate(newIceCandidate)
        .then(tapAsync(this.handleConnectionSuccess(peerConnection)))
        .catch(tapAsync(this.handleConnectionError(peerConnection)));
    }
  };

  getOtherPeer = (peerConnection) => {
    return (peerConnection === this.localPeerConnection)
      ? this.remotePeerConnection
      : this.localPeerConnection;
  };

  handleConnectionChange = (event) => {

  };

  handleConnectionSuccess = (peerConnection: RTCPeerConnection) => async () => {

    console.log('peer connected', peerConnection);
  };

  handleConnectionError = (peerConnection: RTCPeerConnection) => async (error: any) => {
    console.log('Unable to connect to peer');
  };

  createdOffer = (description: RTCSessionDescription) => {
    this.localPeerConnection.setLocalDescription(description)
      .then(this.setLocalDescriptionSuccess(this.localPeerConnection))
      .catch(this.setSessionDescriptionError);

    this.remotePeerConnection.setRemoteDescription(description)
      .then(this.setRemoteDescriptionSuccess(this.remotePeerConnection))
      .catch(this.setSessionDescriptionError);

    this.remotePeerConnection.createAnswer()
      .then(this.createdAnswer)
      .catch(this.setSessionDescriptionError);
  };

  createdAnswer = (description: RTCSessionDescription) => {
    this.remotePeerConnection.setLocalDescription(description)
      .then(this.setLocalDescriptionSuccess(this.remotePeerConnection))
      .catch(this.setSessionDescriptionError);

    this.localPeerConnection.setLocalDescription(description)
      .then(this.setRemoteDescriptionSuccess(this.localPeerConnection))
      .catch(this.setSessionDescriptionError);
  };

  setDescriptionSuccess = () => async (type: string, peerConnection: RTCPeerConnection) => {

  };

  setLocalDescriptionSuccess = (peerConnection: RTCPeerConnection) => async () => {

  };

  setSessionDescriptionError = (error) => {

  };

  setRemoteDescriptionSuccess = (peerConnection: RTCPeerConnection) => async () => {

  };

  callAction = () => {
    const videoTracks = this.localStream.getVideoTracks();
    const audioTracks = this.localStream.getAudioTracks();

    const servers = null;

    this.localPeerConnection = new RTCPeerConnection(servers);
    this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
    this.localPeerConnection.addEventListener('icecandidate', this.handleConnectionChange);

    this.remotePeerConnection = new RTCPeerConnection(servers);
    this.remotePeerConnection.addEventListener('icecandidate', this.handleConnection);
    this.remotePeerConnection.addEventListener('icecandidate', this.handleConnectionChange);

    this.localPeerConnection.createOffer(this.offerOptions);

  };


  render() {
    return (
      <div className='videoStream'>
        <div className="videos">
          <video className="localVideo" ref={this.localVideo} autoPlay playsInline />
          <video className="remoteVideo" ref={this.remoteVideo} autoPlay playsInline />
        </div>
        <div className="controls">
          <button className="startStream">Start Stream</button>
          <button className="call">Call</button>
          <button className="hangup">Hang up</button>
        </div>
      </div>
    );
  }
}
