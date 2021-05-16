import NodeMediaServer from 'node-media-server';
import ffmpeg from 'fluent-ffmpeg';
import { Writable } from 'stream';
import { DB } from './db/index';
import Channel from './classes/Channel';

const config = {
  logType: 3,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
};

const nms = new NodeMediaServer(config)

const writeStream = () => new Writable({
  objectMode: true,
  write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
    console.log('write', chunk)
    callback(null)
  }
})

nms.on('postPublish', async (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  await DB.Models.Channel.findOneAndUpdate({ slug: 'foonta' }, { live: true })
  const channel = await Channel.getChannel('foonta')
  channel.startStream()
  // channel.stream = ffmpeg('rtmp://127.0.0.1/live/test')
  //   .outputFormat('flv')
  //   .pipe(writeStream())
  //   .on('end', (...args) => {
  //     console.log('ffmpeg end', ...args)
  //   })
});


nms.on('doneConnect', async (id, StreamPath, args) => {
  const channel = await Channel.getChannel('foonta')
  channel.stopStream()
})

export default nms
