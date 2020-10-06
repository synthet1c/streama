import { Transform } from "stream";

const delay = (timeout: number) => new Transform({
  transform(chunk: any, encoding: BufferEncoding, callback) {
    setTimeout(() => {
      callback(null, chunk);
    }, timeout);
  },
});

export default delay
