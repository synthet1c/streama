import Client from './Client';
import Slave from './Slave';
import Node from './Node'

// Socket IO connection to Nodes
// Communication between Cluster and Node is independent of the server

export default class Cluster {

  public master: Node
  public backup: Node
  private slaves: Set<Node> = new Set

  constructor(master: Node) {
    this.master = master
  }

  public addSlave(slave: Node) {
    // this.slaves.add(new Node(slave))
  }

  // stream the video
  public stream(stream) {
    this.master.stream(stream)
    this.backup.stream(stream)
    this.slaves.forEach((slave: Node) => slave.stream(stream))
  }

  // send a message
  public send(event: string, value?: any) {
    this.master.send(event, value)
    this.backup.send(event, value)
    this.slaves.forEach((slave: Node) => slave.send(event, value))
  }

  public async healthCheck() {
    const health = await this.broadcast('healthCheck')
  }

  public async setBackup(node) {
    await this.broadcast('setBackup', node.toSignal())
  }

  public async broadcast(event: string, value?: any) {
    await Promise.all([...this.slaves]
      .map(slave => slave.send(event, value))
    )
  }
}
