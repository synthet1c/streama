import { UserID } from './types';

export default class Message {
  public type: string
  public origin: UserID
  public target: UserID
  public payload: any
  public created: string
  public from: UserID

  constructor(message) {
    this.type = message.type
    this.created = (new Date().toISOString())
  }

  static of(message) {

  }

}
