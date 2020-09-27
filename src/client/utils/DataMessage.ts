import { trace } from '../../shared/trace';

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

const types = {
  KEY: 1,
  STRING: 2,
  DATE: 3,
  NUMBER: 4,
  UNSIGNED_INT_8: 5,
  UNSIGNED_INT_16: 6,
  UNSIGNED_INT_32: 7,
  SIGNED_INT_8: 8,
  SIGNED_INT_16: 9,
  SIGNED_INT_32: 10,
  INT_8_ARRAY: 11,
}

export interface IDataOptions {
  type?: number
  instance?: any | ((x: any) => any)
  parser?: any | ((view: DataView, i: number, buffer: ArrayBuffer, l: number) => any)
  ctor?: any | (<T>(x: T) => Uint8Array | ArrayBuffer)
  byteLength?: number | ((x: any) => number)
}


function data(options: number | IDataOptions) {
  return function(target, key) {

    let _keys = Reflect.getMetadata('data:_keys', target) || []
    const keys = _keys.concat(key)

    if (typeof options === 'number') {
      options = { type: options }
    }

    Reflect.defineMetadata('data:_keys', keys, target)
    Reflect.defineMetadata(`data:${key}`, {
      ...parsers[options.type],
      ...options
    }, target)
  }
}

class DataMessage {

  init(props) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value
    }
  }

  getBuffer() {
    const keys = Reflect.getMetadata('data:_keys', Object.getPrototypeOf(this)) || []
    console.log('keys', keys, this)
    let i = 0
    let buffer = new ArrayBuffer(0)

    for (const key of keys) {

      const value = this[key]
      const meta = Reflect.getMetadata(`data:${key}`, Object.getPrototypeOf(this))
      const type = meta.type
      const instance = meta.ctor(value)
      const byteLength = callOrReturn(meta.byteLength)(value)

      let property = new ArrayBuffer(0)

      const keyBuffer = new ArrayBuffer(2)
      const keyView = new DataView(keyBuffer)

      keyView.setUint8(0, types.KEY)
      keyView.setUint8(1, key.length)

      const _keyBuffer = _concatBuffers(keyBuffer, parsers[types.KEY].ctor(key))

      property = _concatBuffers(property, _keyBuffer)

      const description = new ArrayBuffer(5)
      const view = new DataView(description)

      view.setUint8(0, meta.type)
      view.setUint32(1, byteLength)

      const TLV = _concatBuffers(description, instance)

      property = _concatBuffers(property, TLV)

      // add all the properties to the buffer
      buffer = _concatBuffers(buffer, property)

      i = buffer.byteLength
    }

    return buffer
  }

  static parseBuffer(buffer: Uint8Array | ArrayBuffer) {

    let i = 0
    const view = new DataView('buffer' in buffer && buffer.buffer || buffer)
    const result = {}

    while (i < buffer.byteLength) {
      const keyType = view.getUint8(i)
      if (keyType !== 1) {
        throw new Error(`DataMessage :: all properties must have a key { i: ${i} }`)
      }
      i += 1
      const keyLength = view.getUint8(i)
      i += 1
      const key = parsers[types.KEY].parser(view, i, buffer, keyLength)
      i += keyLength

      const meta = Reflect.getMetadata(`data:${key}`, VideoMessage.prototype)

      const type = view.getUint8(i)
      i += 1
      const length = view.getUint32(i)
      i += 4
      const value = meta.parser(view, i, buffer, length)
      i += length

      console.log('decoded', {
        key,
        type,
        length,
        value,
        meta,
      })

      result[key] = value
    }

    return result
  }

}

export interface IParsers {
  [dataType: number]: IDataOptions
}

const parsers: IParsers = {
  [types.KEY]: {
    instance: String,
    parser: (view, i, buffer, l) => Array.from(new Uint8Array(buffer.slice(i, i + l))).map((x: number) => String.fromCharCode(x)).join(''),
    ctor: (string: string) => new Uint8Array(string.split('').map((char) => char.charCodeAt(0))),
    byteLength: (string: string) => string.length,
  },
  [types.STRING]: {
    instance: String,
    parser: (view, i, buffer, l) => Array.from(new Uint8Array(buffer.slice(i, i + l))).map((x: number) => String.fromCharCode(x)).join(''),
    ctor: (string: string) => new Uint8Array(string.split('').map((char) => char.charCodeAt(0))),
    byteLength: (string: string) => string.length,
  },
  [types.DATE]: {
    instance: String,
    parser: (view, i, buffer, l) => new Date(Array.from(new Uint8Array(buffer.slice(i, i + l))).map((x: number) => String.fromCharCode(x)).join('')),
    ctor: (date) => new Uint8Array(new Date(date).toISOString().split('').map((char) => char.charCodeAt(0))),
    byteLength: (date) => 24,
  },
  [types.UNSIGNED_INT_8]: {
    instance: Number,
    parser: (view, i) => view.getUInt8(i),
    ctor: (number, i) => {
      const buffer = new ArrayBuffer(4)
      const view = new DataView(buffer)
      view.setUint8(0, number)
      return buffer
    },
    byteLength: (number) => 2,
  },
  [types.UNSIGNED_INT_16]: {
    instance: Number,
    parser: (view, i) => view.getUInt16(i),
    ctor: (number, i) => {
      const buffer = new ArrayBuffer(4)
      const view = new DataView(buffer)
      view.setUint16(0, number)
      return buffer
    },
    byteLength: (number) => 2,
  },
  [types.UNSIGNED_INT_32]: {
    instance: Number,
    parser: (view, i) => view.getUint32(i),
    ctor: (number, i) => {
      const buffer = new ArrayBuffer(4)
      const view = new DataView(buffer)
      view.setUint32(0, number)
      return buffer
    },
    byteLength: (number) => 4,
  },
  [types.INT_8_ARRAY]: {
    instance: Uint8Array,
    parser: (view, i, buffer, l) => buffer.slice(i, i + l),
    ctor: (int8arr, i) => new Int8Array(int8arr),
    byteLength: (int8arr) => int8arr.byteLength,
  },
}

/*
        |  1   2   3   4   5   6   7   8   9   10   11   12   14   15   16
        | ---------------------------------------------------------------------
String  |  T (1) |    length (4)     |    <------- value (l) --------->

KEY 1 byte
KEY LENGTH : 1 byte
KEY VALUE : keyLength bytes
TYPE: 1 byte
LENGTH: 4 bytes
VALUE: length bytes
*/


export interface VideoMessageProps {
  type: string
  message: string
  data: Uint8Array
  created: Date | number
  id: number
}

export default class VideoMessage extends DataMessage {

  ['constructor'] = VideoMessage

  @data(types.STRING)
  type: string

  @data(types.STRING)
  message: string

  @data(types.INT_8_ARRAY)
  data: Uint8Array

  @data(types.DATE)
  created: Date | number

  @data(types.UNSIGNED_INT_32)
  id: number

  constructor(props: VideoMessageProps) {
    super()
    this.init(props)
  }
}

const callOrReturn = (valOrFn) => (...args: any[]) => {
  if (typeof valOrFn === 'function') {
    return valOrFn(...args)
  }
  return valOrFn
}


function concatTypedArrays(a: Uint8Array, b: Uint8Array): Uint8Array { // a, b TypedArray of same type
  const c = new Uint8Array(a.byteLength + b.byteLength);
  c.set(a, 0);
  c.set(b, a.byteLength);
  return c;
}

function _concatBuffers(
  a: TypedArray | ArrayBuffer,
  b: TypedArray | ArrayBuffer,
) {
  return concatTypedArrays(
    new Uint8Array(('buffer' in a) ? a.buffer : a),
    new Uint8Array(('buffer' in b) ? b.buffer : b),
  ).buffer;
}
