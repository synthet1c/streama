import fs from "fs";
import path from "path";
import delay from '../transforms/delay';
import wrapWithFrameMessage from '../transforms/wrapWithFrameMessage';
import writeToSocket from '../write/writeToSocket';
import { Socket } from 'socket.io';

interface BasicStreamFileParams {
  filename: string
  socket: Socket
  highWaterMark?: number
}

const basicStreamFile = async ({
  filename,
  socket,
  highWaterMark = 256 * 1024
}: BasicStreamFileParams) => {
  const stats = await fs.promises.stat(path.resolve(process.cwd(), filename));

  return fs.createReadStream(path.resolve(process.cwd(), filename), {
    highWaterMark,
  })
    .pipe(delay(1000))
    .pipe(wrapWithFrameMessage())
    .pipe(writeToSocket({ socket }), { end: true })
    .on('end', (e) => {
      console.log('stream:end', e);
    })
}

export default basicStreamFile
