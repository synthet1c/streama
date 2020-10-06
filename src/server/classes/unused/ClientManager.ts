import Client from './Client';

export default class ClientManager {
  clients: Set<Client> = new Set

  addClient(client: Client) {
    this.clients.add(client)
  }

  removeClient(client: Client) {
    this.clients.delete(client)
    client.disconnect()
  }
}
