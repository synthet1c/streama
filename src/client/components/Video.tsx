import React, { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from '../providers/WebSocket';
import { Box, Card, CardContent, CardHeader } from '@material-ui/core';
import { WebRTCContext } from '../providers/WebRTC';
import { IMessage } from '../webrtc/interfaces';
import DataMessage from '../utils/DataMessage';
import VideoMessage from '../utils/VideoMessage';

const Video = ({}) => {

  const { socket } = useContext(WebSocketContext)
  const webrtc = useContext(WebRTCContext)
  const videoRef = useRef<HTMLVideoElement>()
  const codec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2'

  useEffect(() => {
    const mediaSource = new MediaSource()

    videoRef.current.src = window.URL.createObjectURL(mediaSource)

    mediaSource.addEventListener('sourceopen', (event) => {

      const cache: ArrayBuffer[] = []
      let position = 0
      let bufferedCount = 0

      const sourceBuffer = mediaSource.addSourceBuffer(codec)

      sourceBuffer.addEventListener('updateend', (e) => {
        if (!cache.length) {
          // mediaSource.endOfStream()
        }
      })

      sourceBuffer.addEventListener('update', () => {
        const chunk = cache[position]
        position++
        if (chunk instanceof Uint8Array) {
          sourceBuffer.appendBuffer(chunk)
        }
      })


      socket.on('data', (data) => {
        const message: any = DataMessage.parseBuffer(data, VideoMessage)
        cache.push(new Uint8Array(message.data))
        // console.log('socket data', message)
        // get the first 10 chunks before appending
        if (bufferedCount++ === 10) {
          sourceBuffer.appendBuffer(cache[position])
          position++
        }
      })

      webrtc.on('request:video', (message: IMessage) => {
        let k = 0
        while (k < cache.length) {
          webrtc.send('provide:video', message.origin, {
            type: 'provide:video',
            payload: [0, 1, 2],
            target: message.origin
          }, true)
          k++
        }

      })

      webrtc.on('provide:video', (data) => {
        console.log('provide:video', data)
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
