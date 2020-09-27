import React, { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from '../providers/WebSocket';
import { Box, Card, CardContent, CardHeader } from '@material-ui/core';
import { WebRTCContext } from '../providers/WebRTC';
import { IMessage } from '../webrtc/interfaces';

const Video = ({}) => {

  const { socket } = useContext(WebSocketContext)
  const webrtc = useContext(WebRTCContext)
  const videoRef = useRef<HTMLVideoElement>()
  const codec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2'
  const cache: ArrayBuffer[] = []

  useEffect(() => {
    const mediaSource = new MediaSource()
    videoRef.current.src = window.URL.createObjectURL(mediaSource)
    mediaSource.addEventListener('sourceopen', (event) => {

      const sourceBuffer = mediaSource.addSourceBuffer(codec)

      sourceBuffer.addEventListener('updateend', (e) => {
        if (!cache.length) {
          // mediaSource.endOfStream()
        }
      })

      sourceBuffer.addEventListener('update', () => {
        const chunk = cache.splice(0, 1).shift()
        if (chunk) {
          sourceBuffer.appendBuffer(chunk)
        }
      })

      let first = true

      socket.on('data', (data) => {
        if (first) {
          sourceBuffer.appendBuffer(new Uint8Array(data))
          first = false
          return
        }
        cache.push(new Uint8Array(data))
      })

      webrtc.on('request:video', (message: IMessage) => {
        webrtc.send('provide:video', message.origin, {
          type: 'provide:video',
          payload: [0, 1, 2],
          target: message.origin
        }, true)
      })

      webrtc.on('provide:video', (data) => {
        console.log('provide:video', data)
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