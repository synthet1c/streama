import { Writable } from "stream";
import { Socket } from 'socket.io';

interface WriteToSocketParams {
  socket: Socket
}

const writeToSocket = ({ socket }: WriteToSocketParams) => new Writable({
  write: (chunk, encoding, callback) => {
    // console.log('writing')
    socket.emit('data', chunk);
    callback(null)
  }
})

export default writeToSocket
