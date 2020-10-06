"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor({ id, socket }) {
        this['constructor'] = Client;
        this.sessionId = id;
        this.socketId = socket.id;
        this.socket = socket;
        this.active = true;
        Client.cache.set(this.socketId, this);
    }
    disconnect() {
        Client.cache.delete(this.sessionId);
    }
    static getBySessionId(sessionId) {
        return Client.cache.get(sessionId);
    }
}
exports.default = Client;
Client.cache = new Map;
//# sourceMappingURL=Client.js.map