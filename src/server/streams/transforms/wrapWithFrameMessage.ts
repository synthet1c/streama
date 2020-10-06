import { Transform } from "stream";
import FrameMessage from '../../messages/FrameMessage';

const wrapWithFrameMessage = ({
  index = 0,
  byteLength = 0,
} = {}) => new Transform({
  transform(chunk, enc, callback) {
    const message = new FrameMessage({
      type: 'frame',
      from: 'server',
      target: '',
      index: index++,
      origin: 'server',
      data: chunk,
      created: new Date(),
      startByte: byteLength,
      endByte: byteLength + chunk.byteLength,
      timeStart: 0,
      timeEnd: 0,
    }).getBuffer();
    byteLength += chunk.byteLength;
    callback(null, message);
  },
});

export default wrapWithFrameMessage
