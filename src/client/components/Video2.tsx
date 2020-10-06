import React, { Component, createRef, RefObject } from 'react';
import { WebRTCContext } from '../providers/WebRTC';
import { Socket } from 'socket.io';
import { Box, Card, CardContent, CardHeader } from '@material-ui/core';
import Node from '../webrtc/Node'
import { IMessage } from '../webrtc/interfaces';
import VideoMessage from '../utils/VideoMessage';
import FrameMessage from '../utils/FrameMessage';
import DataMessage from '../utils/DataMessage';

// Frame data comes directly from the server
interface FrameData {
  isInit: boolean,
  data: Uint8Array,
  index: number,
  startByte: number,
  endByte: number,
  timeStart: number,
  timeEnd: number,
}

interface IVideoMessage {
  [key: string]: any
}



export default class Video extends Component<any, any> {

  queued: FrameData[] = []
  cache: FrameData[] = []
  cacheLength: number = 20
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
  }

  componentDidMount() {
    this.webrtc = this.context
    this.socket = this.context.socket
    // request init frame from parent
    // receive stream from parent
    // buffer contents of stream from parent
    this.mediaSource = new MediaSource()
    this.videoRef.current.src = window.URL.createObjectURL(this.mediaSource)
    this.mediaSource.addEventListener('sourceopen', (event) => {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(this.codec)
      this.sourceBuffer.addEventListener('updateend', this.flushVideoFrameBuffer)
    })
    this.socket.on('data', this.onData)
    this.webrtc.on('request:initFrame', this.requestInitFrame)
    this.webrtc.on('provide:initFrame', this.receiveInitFrame)
    this.webrtc.on('provide:frame', this.receiveFrame)
  }

  componentWillUnmount() {
    this.mediaSource = null
    this.sourceBuffer.removeEventListener('updateend', this.flushVideoFrameBuffer)
    this.sourceBuffer = null
  }

  private flushVideoFrameBuffer = () => {
    if (!this.initFrame || this.sourceBuffer.updating) return

    // concat the pending array buffers and add them to the source buffer all together
    if (this.queued.length) {
      // remove all the Frames from the queue
      const frames = this.queued.splice(0, this.queued.length)

      this.cache = [...this.cache, ...frames].slice(-this.cacheLength)

      // get the total byte size of the queued Frames
      const byteLength = frames.reduce((acc, frame) => {
        return acc + frame.data.byteLength
      }, 0)

      if (frames.length > 1) {
        // create a new Array allocated to the total byte size
        const bufferArray = new Uint8Array(byteLength)

        let currLength = 0
        frames.forEach(frame => {
          bufferArray.set(new Uint8Array(frame.data), currLength)
          currLength += frame.data.byteLength
        })
        console.log('concat', {
          length: frames.length,
          frames,
          bufferArray,
          byteLength,
        })

        // append the entire buffer
        this.sourceBuffer.appendBuffer(bufferArray)
      } else {
        this.sourceBuffer.appendBuffer(new Uint8Array(frames[0].data))

        console.log('concat', {
          length: frames.length,
          frames,
          byteLength,
        })
      }

      // save the last frame in the case we need to reconnect
      this.lastFrame = frames[frames.length - 1]
    }
  }


  requestInitFrame = (message: FrameMessage) => {
    const data = new VideoMessage({
      type: 'initFrame',
      origin: message.origin,
      target: message.from,
      from: this.webrtc.id,
      data: this.initFrame.data,
      created: new Date(),
    }).getBuffer()
    this.webrtc.sendData('provide:initFrame', message.origin, new Uint8Array(data), true)
  }


  receiveInitFrame = (frame: FrameMessage) => {
    if (!this.initFrame) {
      this.initFrame = {
        isInit: true,
        data: frame.data,
        index: frame.index,
        startByte: frame.startByte,
        endByte: frame.endByte,
        timeStart: frame.timeStart,
        timeEnd: frame.timeEnd,
      }
      // append the first frame of data
      this.sourceBuffer.appendBuffer(this.initFrame.data)
    }
  }

  onData = (message) => {
    const frame: any = DataMessage.parseBuffer(message, FrameMessage)
    if (!this.initFrame) {
      this.receiveInitFrame(frame)
    } else {
      this.receiveFrame(frame)
    }
    this.webrtc.broadcast(message)
  }

  receiveFrame = (frame: FrameMessage) => {
    // check if the frame already exists in the buffer. Note: this could skip frames
    this.queued.push({
      isInit: false,
      data: frame.data,
      index: frame.index,
      startByte: frame.startByte,
      endByte: frame.endByte,
      timeStart: frame.timeStart,
      timeEnd: frame.timeEnd,
    } as FrameData)
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
