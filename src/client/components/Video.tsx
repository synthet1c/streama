import React, { useContext, useEffect, useRef } from 'react';
import { Box, Card, CardContent, CardHeader } from '@material-ui/core';
import { WebRTCContext } from '../providers/WebRTC';
import { IMessage } from '../webrtc/interfaces';
import DataMessage from '../utils/DataMessage';
import VideoMessage from '../utils/VideoMessage';
import FrameMessage from '../utils/FrameMessage';

interface IFrame {
  data: ArrayBuffer
  created: Date
  index: number
}

const Video = ({}) => {

  const webrtc = useContext(WebRTCContext)
  const socket = webrtc.socket
  const videoRef = useRef<HTMLVideoElement>()
  const codec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2'

  useEffect(() => {
    const mediaSource = new MediaSource()

    videoRef.current.src = window.URL.createObjectURL(mediaSource)

    mediaSource.addEventListener('sourceopen', (event) => {

      let initFrame: ArrayBuffer = null
      const cache: ArrayBuffer[] = []
      const _cache: IFrame[] = []
      let position = 0
      let bufferedCount = 0
      let open = false

      const sourceBuffer = mediaSource.addSourceBuffer(codec)

      sourceBuffer.addEventListener('updateend', (e) => {
        console.log('updateend')
        // finished = true
        // mediaSource.endOfStream()
      })

      sourceBuffer.addEventListener('update', () => {
        const chunk = cache[position]
        console.log('update')
        position++
        if (chunk instanceof Uint8Array) {
          open = false
          sourceBuffer.appendBuffer(chunk)
        } else {
          open = true
        }
      })


      // receive the data from the server socket
      let i = 0
      socket.on('data', (data) => {
        const message: any = DataMessage.parseBuffer(data, FrameMessage)
        if (!initFrame) {
          initFrame = message
        }
        cache.push(new Uint8Array(message.data))

        _cache.push({
          created: message.created,
          index: i++,
          data: new Uint8Array(message.data),
        })
        // console.log('socket data', message)
        // get the first 10 chunks before appending
        if (bufferedCount++ === 10) {
          sourceBuffer.appendBuffer(cache[position])
          position++
        }
      })

      webrtc.on('request:video', (message: IMessage) => {
        webrtc.sendData('provide:video:init', message.from, initFrame, true)
        // let k = 0
        // while (k < cache.length) {
        //   webrtc.sendData('provide:video:frame', message.from, cache[k], true)
        //   k++
        // }
      })

      webrtc.on('request:frame', (message: IMessage) => {
        webrtc.sendData('provide:video:frame', message.from, cache[message.payload.frame], true)
      })


      webrtc.on('provide:video:init', (message) => {
        initFrame = new Uint8Array(message.data)
        sourceBuffer.appendBuffer(initFrame)
        console.log('sourceBuffer', sourceBuffer, mediaSource)
      })

      webrtc.on('provide:video:frame', (message) => {
        cache.push(new Uint8Array(message.data))
        // console.log('socket data', message)
        // get the first 10 chunks before appending
        if (bufferedCount++ === 10) {
          sourceBuffer.appendBuffer(cache[position])
          position++
        }
        console.log('sourceBuffer', sourceBuffer, mediaSource)
      })

      socket.on('stream', (data) => {
        console.log('socket:stream', data)
      })

      socket.on('profile-image', (data) => {
        console.log('profile-image', data)
      })

      socket.emit('gimme-da-video', {})

    })
  }, [])

  const play = (e) => videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()

  return (
    <Box>
      <Card>
        <CardHeader>Video</CardHeader>
        <CardContent>
          <video autoPlay muted onClick={play} ref={videoRef}/>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Video
