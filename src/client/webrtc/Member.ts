import Peer from './Peer';

export default class Member {
  name: string
  avatar: string
  id: string
  peer?: Peer
  constructor({ name, avatar, id, peer }) {
    this.name = name
    this.avatar = avatar
    this.id = id
    this.peer = peer
  }
}
