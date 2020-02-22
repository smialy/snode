import { ITransport, ISerializer, ITransportHandler } from '@snode/common';
import { IWorkerController, IRouterTransport } from './types/index';

interface ISocketTransport {
    send(message: string): void;
    close(code?: number, reason?: string): void;
    on(name: string, callback: (...args: any) => void)
}

export class WebSocketServerTransport implements IRouterTransport {

    constructor(
        private socket: ISocketTransport,
        private serializer: ISerializer,
        private protocol: ITransportHandler,
        readonly trusted: boolean = false,
    ) {
    }
    open() {
        this.protocol.onOpen(this);
        this.socket.on('message', (payload: string) => {
            try {
                this.protocol.onMessage(this.serializer.unserialize(payload));
            } catch(e) {
                console.warn(e);
                this.close(1003, "protocol violation");
            }
        });
        this.socket.on('close', (code, reason) => this.protocol.onClose(code, reason));
        this.socket.on('error', error => this.protocol.onError(error));
    }

    send(message: any) {
        const data = this.serializer.serialize(message);
        this.socket.send(data);
    }
    close(code: number = 1000, reason: string = '') {
        this.socket.close(code, reason)
    }
}

class ProcessTransport {
    constructor(private actions: any) {

    }
    open() {
        process.on('message', (payload: any) => {
            try {
                this.onMessage(payload);
            } catch(e) {
                console.warn(e);
                // this.close(1003, "protocol violation");
            }
        });
        // process.on('close', (code, signal: any) => this.onClose(code, signal));
        // process.on('error', error => this.onError(error));
    }
    onMessage(data: any) {

    }
    onClose(code: number, signal: string) {

    }
    onError(error: any) {

    }
}
