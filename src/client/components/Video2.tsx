import React, { Component, createRef, RefObject } from 'react';
import { WebRTCContext } from '../providers/WebRTC';
import { Socket } from 'socket.io';
import { Box, Card, CardContent, CardHeader } from '@material-ui/core';
import Node from '../webrtc/Node'
import { IMessage } from '../webrtc/interfaces';
import VideoMessage from '../utils/VideoMessage';
import FrameMessage from '../utils/FrameMessage';

// Frame data comes directly from the server
interface FrameData {
  isInit: boolean,
  data: Uint8Array,
  startByte: number,
  endByte: number,
  timeStart: number,
  timeEnd: number,
}

interface IVideoMessage {
  [key: string]: any
}



class Video extends Component<any, any> {

  queued: FrameData[] = []
  requested: boolean = false

  initFrame: FrameData
  lastFrame: FrameData

  webrtc: Node
  socket: Socket

  videoRef: RefObject<HTMLVideoElement> = createRef()
  mediaSource: MediaSource
  sourceBuffer: SourceBuffer

  codec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2'

  static contextType = WebRTCContext

  constructor(props: any) {
    super(props);
    this.webrtc = this.context
    this.socket = this.context.socket
  }

  componentDidMount() {
    // request init frame from parent
    // receive stream from parent
    // buffer contents of stream from parent
    this.mediaSource = new MediaSource()
    this.sourceBuffer = this.mediaSource.addSourceBuffer(this.codec)
    this.sourceBuffer.addEventListener('updateend', this.flushVideoFrameBuffer)
    this.webrtc.on('request:initFrame', this.requestInitFrame)
    this.webrtc.on('provide:initFrame', this.receiveInitFrame)
    this.webrtc.on('receive:frame', this.receiveFrame)
    this.webrtc.sendHostMessage('request:initFrame')
  }

  componentWillUnmount() {
    this.mediaSource = null
    this.sourceBuffer.removeEventListener('updateend', this.flushVideoFrameBuffer)
    this.sourceBuffer = null
  }

  private flushVideoFrameBuffer() {
    if (!this.initFrame || this.sourceBuffer.updating) return

    if (this.queued.length) {
      // concat the pending array buffers and add them to the source buffer all together

      let byteLength = 0
      // get the total byte size of the queued Frames
      this.queued.forEach(frame => {
        byteLength += frame.data.byteLength
      })

      // create a new Array allocated to the total byte size
      const bufferArray = new Uint8Array(byteLength)

      let currLength = 0
      this.queued.forEach(frame => {
        bufferArray.set(frame.data, currLength)
        currLength += frame.data.byteLength
      })

      // append the entire buffer
      this.sourceBuffer.appendBuffer(bufferArray)

      // save the last frame in the case we need to reconnect
      this.lastFrame = this.queued[this.queued.length - 1]

      // clear the buffer
      this.queued = []
    }
  }


  requestInitFrame(message: FrameMessage) {
    const data = new VideoMessage({
      type: 'initFrame',
      origin: message.origin,
      target: message.from,
      from: this.webrtc.id,
      data: this.initFrame.data,
      created: new Date(),
    }).getBuffer()
    this.webrtc.sendData('provide:initFrame', message.origin, data, true)
  }


  receiveInitFrame(frame: FrameMessage) {
    if (!this.initFrame) {
      this.initFrame = {
        isInit: true,
        data: frame.data,
        startByte: frame.startByte,
        endByte: frame.endByte,
        timeStart: frame.timeStart,
        timeEnd: frame.timeEnd,
      }
      // append the first frame of data
      this.sourceBuffer.appendBuffer(this.initFrame.data)
    }
  }

  receiveFrame(frame: FrameMessage) {
    // check if the frame already exists in the buffer
    if (!this.initFrame || this.lastFrame.endByte < frame.endByte) {
      this.queued.push({
        isInit: false,
        data: frame.data,
        startByte: frame.startByte,
        endByte: frame.endByte,
        timeStart: frame.timeStart,
        timeEnd: frame.timeEnd,
      } as FrameData)
    }
    this.flushVideoFrameBuffer()
  }

  render() {
    const play = (e) => this.videoRef.current.paused ? this.videoRef.current.play() : this.videoRef.current.pause()

    return (
      <Box>
        <Card>
          <CardHeader>Video</CardHeader>
          <CardContent>
            <video autoPlay muted onClick={play} ref={this.videoRef}/>
          </CardContent>
        </Card>
      </Box>
    )
  }

}
