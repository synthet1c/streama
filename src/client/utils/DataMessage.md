# js bin
[jsbin](https://jsbin.com/fazimugapi/edit?js,output)

```javascript
const buffer = new ArrayBuffer(256)
const view = new DataView(buffer)

const schema = {
  type: String,
  message: String,
  timestamp: Date,
  number: Number
}


const types = {
  STRING: 1,
  DATE: 2,
  NUMBER: 3,
  UNSIGNED_INT_8: 4,
  UNSIGNED_INT_16: 5,
  UNSIGNED_INT_32: 6,
  SIGNED_INT_8: 7,
  SIGNED_INT_16: 8,
  SIGNED_INT_32: 9,
  INT_8_ARRAY: 10,
}


function data(options) {
  return function(target, key, descriptor) {

    const {
      type,
      instance,
      parser,
      byteLength
    } = options

    return descriptor
  }
}

class BinaryMessage {

  getData() {



  }

}

const parsers = {
  [types.STRING]: {
    instance: String,
    parser: (view, i, binary, l) => Array.from(binary.slice(i, i + l)).map(x => String.fromCharCode(x)).join(''),
    ctor: (string) => string.split('').map((char) => String.fromCharCode(char)),
    byteLength: (string) => string.length,
  },
  [types.DATE]: {
    instance: String,
    parser: (view, i, binary, l) => Array.from(binary.slice(i, i + l)).map(x => String.fromCharCode(x)).join(''),
    ctor: (date) => new Date(date).toISOString().split('').map((char) => String.fromCharCode(char)),
    byteLength: (date) => 24,
  },
  [types.UNSIGNED_INT_8]: {
    instance: Number,
    parser: (view, i) => view.getUInt8(i),
    ctor: (number) => number,
    byteLength: (number) => 2,
  },
  [types.UNSIGNED_INT_16]: {
    instance: Number,
    parser: (view, i) => view.getUInt16(i),
    ctor: (number) => number,
    byteLength: (number) => 2,
  },
  [types.UNSIGNED_INT_32]: {
    instance: Number,
    parser: (view, i) => view.getUInt32(i),
    ctor: (number, i) => number,
    byteLength: (number) => 4,
  },
  [types.INT_8_ARRAY]: {
    instance: Uint8Array,
    parser: (view, i, binary, l) => binary.slice(i, i + l),
    ctor: (int8arr, i) => int8arr,
    byteLength: (int8arr) => int8arr.byteLength,
  },
}


class VideoMessage extends BinaryMessage {

  @data({
    type: types.STRING,
    instance: String,
    parser: String,
    byteLength: (string) => string.length
  })
  type

  @data({
    type: types.STRING
  })
  message

  @data({
    type: types.INT_8_ARRAY,
    byteLength: 1024
  })
  data

  constructor({
    type,
    message,
    data
  }) {
    super()
    this.type = type
    this.message = message
    this.data = data
  }

}



const toBinary = (json) => {

  let l = 0;

  // get the byte length of the ArrayBuffer
  for (const [key, type] of Object.entries(schema)) {
    l += (1 + 4)
    switch (true) {
      // 16 bit UTF-8
      case type === String:
        l += json[key].length
        break;
      // 32 bit
      case type === Number:
        l += 4
        break;
      case type === Date:
        l += 24
        break;
    }
  }

  console.log({ l })

  const buffer = new ArrayBuffer(l);
  const view = new DataView(buffer);

  let i = 0;

  console.log({ schema, json })

  for (const [key, type] of Object.entries(schema)) {

    const value = json[key];

    switch (true) {

      case type === String:
        view.setUint8(i, 1); // type
        i += 1
        view.setUint32(i, value.length); // length
        i += 4; // increase i
        value.split('').forEach((char, j) => {
          view.setUint8(i, char.charCodeAt(0))
          i++
        })
        console.log('set::String', { i, value })
        break;
      case type === Date:
        const date = new Date(value).toISOString()
        console.log('set::Date', { i, value, date })
        view.setUint8(i, 2); // type
        i += 1
        view.setUint32(i, 24); // length
        i += 4; // increase i
        date.split('').forEach((char, j) => {
          console.log('char', char, char.charCodeAt(0), i)
          view.setUint8(i, char.charCodeAt(0))
          i++
        })
        break;
      case type === Number:
        console.log('set::Number', { i, value })
        view.setUint8(i, 3); // type
        i += 1
        view.setUint32(i, 4); // length
        i += 4; // increase i
        view.setUint32(i, value)
        i += 4
        break;
    }
  }

  return trace('buffer')(buffer)

}

const trace = tag => x => (console.log(tag, x), x)

const binaryToNumber = Uint8Arr => {
  var length = Uint8Arr.length;

  let buffer = Buffer.from(Uint8Arr);
  var result = buffer.readUIntBE(0, length);

  return result;
}

const fromBinary = buffer => {

  let i = 0
  let c = 0
  const l = buffer.byteLength
  const values = []

//   buffer = new Uint8Array(buffer)
  const view = new DataView(buffer)

  while (i < l) {

    const type = view.getUint8(i)
    i += 1
    const length = view.getUint32(i)
    i += 4

    console.log({ type, length })

    let value = null
    let parsed = null

    switch (type) {
      case types.STRING:
        value = new Uint8Array(buffer.slice(i, i + length))
        parsed = Array.from(value).map(x => String.fromCharCode(x)).join('')
        break;
      case types.DATE:
        value = trace('int8')(new Uint8Array(buffer.slice(trace('value:i')(i), trace('value:z')(i + length))))
        parsed = Array.from(value).map(x => trace('x')(String.fromCharCode(x))).join('')
        break
      case types.NUMBER:
        value = view.getUint32(i)
        parsed = value
        break;
    }

    i += length

    values.push(trace('values')({
      type,
      length,
      value,
      parsed,
      i,
      l,
    }))


  }

  return values

}

const json = {
  type: 'message',
  message: 'Hello',
  timestamp: new Date(),
  number: 42
}


console.log(
  fromBinary(toBinary(json))
)
```
