import DataMessage, { data, types } from "./DataMessage"

export interface FrameMessageProps {
  type: string
  origin: string
  target: string
  from: string
  data: Uint8Array
  created: Date | number
  startByte: number
  endByte: number
  timeStart: number
  timeEnd: number
}

export default class FrameMessage extends DataMessage {

  ['constructor'] = FrameMessage

  @data(types.STRING)
  type: string

  @data(types.STRING)
  origin: string

  @data(types.STRING)
  target: string

  @data(types.STRING)
  from: string

  @data(types.INT_8_ARRAY)
  data: Uint8Array

  @data(types.DATE)
  created: Date | number

  @data(types.UNSIGNED_INT_32)
  startByte: number

  @data(types.UNSIGNED_INT_32)
  endByte: number

  @data(types.UNSIGNED_INT_32)
  timeStart: number

  @data(types.UNSIGNED_INT_32)
  timeEnd: number

  constructor(props: FrameMessageProps) {
    super()
    this.init(props)
  }
}
