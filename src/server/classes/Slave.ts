import Client from './Client';
import Cluster from './Cluster';

export default class Slave {
  ['constructor'] = Slave
  static cache: Map<Client,Slave> = new Map

  constructor(private master: Cluster, private client: Client) {
    this.constructor.cache.set(client, this)
  }


}
