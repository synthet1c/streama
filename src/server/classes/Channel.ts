import { DB } from '../db/index';
import ffmpeg from 'fluent-ffmpeg';
import { Stream, Writable } from 'stream';
import FrameMessage from '../messages/FrameMessage';
import { concatBuffers } from '../messages/DataMessage';
import Heap from '../datastructures/heap';
import Node from './Node';
import path from 'path';

interface Regions {
  [region: string]: Heap<Node>
}

export default class Channel {

  static channels: Map<string, Channel> = new Map

  data: any
  room: any
  host: Node
  viewers: Regions = {}
  stream: Stream
  initFrames: Uint8Array = Buffer.alloc(0)
  index: number = 0
  bytes: number = 0


  constructor(data) {
    this.data = data
  }


  static async getChannel(slug: string) {
    if (Channel.channels.has(slug)) {
      return Channel.channels.get(slug)
    }
    const data = await DB.Models.Channel.findOne({ slug })
    if (!data) {
      throw new Error(`Channel does not exist`)
    }
    const channel = new Channel(data)
    Channel.channels.set(slug, channel)
    return channel
  }


  addViewer = (node: Node) => {
    const heap = this.getAvailableHeap(node)
    // this.connectToStream(node)
    // heap.insert(node)
  }


  getRegionHeap(region: number) {
    if (!this.viewers[region]) {
      this.viewers[region] = new Heap<Node>(2, (differences) => {
        console.log('difference', differences)
        // connect the user to their network
      })
    }
    return this.viewers[region]
  }


  // allocate viewer to the first heap with space remaining
  // TODO: add region checking,
  // TODO: add score checking (try to not put a higher score in the heap)
  private getAvailableHeap(node: Node) {
    let i = 0
    for (const [key, heap] of Object.entries(this.viewers)) {
      if (heap.size < 16) {
        node.region = key
        return heap
      }
      i++
    }
    return this.getRegionHeap(i)
  }


  startStream = () => {
    ffmpeg.ffprobe(`rtmp://127.0.0.1/live/test`, (err, metadata) => {
      console.log('probe', metadata)
    })
    this.stream =
      ffmpeg(`rtmp://127.0.0.1/live/test`)
        .outputFormat('flv')
        .pipe(new Writable({
          objectMode: true,
          write: this.distributeStream
        }))
  }

  stopStream = () => {
    this.bytes = 0
    this.index = 0
    this.initFrames = Buffer.alloc(0)
    this.viewers = {}
  }


  // connect a user to the stream tree
  connectToStream = (node: Node) => {
    const data = new FrameMessage({
      type: 'data:init',
      from: 'server',
      origin: 'server',
      target: node.id,
      index: 1,
      startByte: 0,
      endByte: this.initFrames.byteLength,
      timeStart: 0,
      timeEnd: 0,
      data: this.initFrames,
      created: new Date()
    }).getBuffer()
    node.sendData('data', data)
  }


  // stream to the root users
  distributeStream = (chunk, encoding, callback) => {
    const data = new FrameMessage({
      type: 'data:stream',
      from: 'server',
      origin: 'server',
      target: '',
      index: this.index += 1,
      startByte: this.bytes,
      endByte: (this.bytes += chunk.byteLength),
      timeStart: 0,
      timeEnd: 0,
      data: chunk,
      created: new Date(),
    }).getBuffer()
    // capture the first three frames which contain the video meta data
    if (this.index < 3) {
      this.initFrames = concatBuffers(this.initFrames, chunk)
    }
    // send the streams to the root users
    for (const [region, heap] of Object.entries(this.viewers)) {
      if (heap.size) {
        Node.getNode(heap.root.id).sendData('data', data)
      }
    }
    callback(null)
  }
}
