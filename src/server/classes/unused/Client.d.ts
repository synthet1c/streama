import { Socket } from 'socket.io';
interface iClientArgs {
    id: string;
    socket: Socket;
}
export default class Client {
    ['constructor']: typeof Client;
    static cache: Map<string, Client>;
    id: string;
    socket: Socket;
    sessionId: string;
    socketId: string;
    active: boolean;
    constructor({ id, socket }: iClientArgs);
    disconnect(): void;
    static getBySessionId(sessionId: string): Client;
}
export {};
