import Cluster from './Cluster';
import Node from '../Node';

/*

+ Distributors receive the signal from the server, split the stream and send to Clusters
+ When the distributor reaches it's connection limit it spawns a new Distributor
+ We can always guarantee that the Distributors will be healthy

 */
export default class Distributor {

  private maxConnections = 16;

  private clusters: Map<string, Cluster> = new Map;
  private distributors: Map<string, Distributor> = new Map;

  // receive stream from Server
  onStream(stream) {
    this.stream(stream);
  }

  // send the stream to each cluster
  stream(stream) {
    this.distributors.forEach((distributor: Distributor) =>
      distributor.stream(stream),
    );
    this.clusters.forEach((cluster: Cluster) =>
      // @ts-ignore
      cluster.stream(stream),
    );
  }

  createCluster(node: Node) {
    const cluster: Cluster = new Cluster(node);
    if (this.distributors.size > this.maxConnections) {
      this.spawnNewDistributor(node.sessionId, cluster);
    } else {
      this.clusters.set(node.sessionId, cluster);
    }
  }

  spawnNewDistributor(sessionId: string, cluster: Cluster) {
    console.log('do something to create a new Distributor instance connected to this one');
  }

  // split stream and send to all Clusters
}
