import DataMessage, { data, types } from "./DataMessage"

export interface VideoMessageProps {
  type: string
  origin: string
  target: string
  from: string
  data: Uint8Array
  created: Date | number
}

export default class VideoMessage extends DataMessage {

  // ['constructor'] = VideoMessage

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

  constructor(props: VideoMessageProps) {
    super()
    this.init(props)
  }
}
