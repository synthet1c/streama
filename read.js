const { Transform, Writable } = require('stream');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg')

const fs = require('fs');

const view = new Transform({
  transform(chunk, enc, callback) {
    console.log(chunk, enc);
    callback(null, chunk);
  },
});

let cache = new Uint8Array(0)
let currProgress = null

const chunkOnProgress = new Transform({
  transform(chunk, enc, callback) {
      // console.log('chunkOnProgress', chunk.byteLength)
      callback(null, chunk);
  },
});


const writeStream = new Writable({
  write(chunk, encoding, callback) {
    const _cache = cache
    cache = new Uint8Array(_cache.byteLength + chunk.byteLength)
    cache.set(_cache)
    cache.set(chunk)
    if (progress[progress.length-1] !== currProgress) {
      let currProgress = progress[progress.length-1]
      console.log('write', cache.byteLength, w, progress[progress.length - 1])
      w++
      cache = new Uint8Array(0)
    }
    callback(null);
  },
});

let p = 0
let w = 0
const progress = []

const inputFilename = 'assets/frag_bunny.mp4';
const outputFilename = 'assets/frag_bunny_output.flv';

// ffmpeg.ffprobe(inputFilename, (err, metadata) => {
//   console.log('probe', metadata)
// })

const stream = fs.createWriteStream(outputFilename)
// make sure you set the correct path to your video file
var proc = ffmpeg(fs.createReadStream(inputFilename, {
  highWaterMark: 1000000
}))
// use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
// .preset('flashvideo')
// .outputFormat('webm')
.outputFormat('webm')
.outputOptions([
  '-preset superfast'
])
// .format('hls')
// .outputFormat('hls')
// .outputOptions([
//   '-hls_time 6',
//   '-hls_list_size 4',
//   '-hls_wrap 40',
//   '-hls_delete_threshold 1',
//   '-hls_flags delete_segments',
//   '-hls_start_number_source datetime',
//   '-preset superfast',
//   '-start_number 10',
// ])
// setup event handlers
.on('end', function() {
  console.log('file has been converted succesfully');
})
.on('error', function(err) {
  console.log('an error happened: ' + err.message);
})
.on('progress', function (_progress) {
  // console.log('progress', _progress)
  if (!currProgress) {
    progress.push(_progress)
    console.log('no progress', _progress)
  } else if (currProgress.timemark !== _progress.timemark) {
    progress.push(_progress)
    console.log('progress', _progress)
  }
  p++
})
// save to stream
// .pipe(chunkOnProgress)
.pipe(writeStream, {end:true}); //end = true, close output stream after writing


