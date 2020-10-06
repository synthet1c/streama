import DataMessage, { data, types } from "./DataMessage"

export interface TestMessageProps {
  Uint32number: number
}

export default class TestMessage extends DataMessage {

  ['constructor'] = TestMessage

  @data(types.UNSIGNED_INT_32)
  Uint32number: number

  constructor(props: TestMessageProps) {
    super()
    this.init(props)
  }
}
