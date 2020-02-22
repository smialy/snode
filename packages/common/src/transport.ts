import { ITransport, TransportEventCallback } from "./types/transport";
import { ISerializer } from "./types/serializer";
import { TransportEventType } from './consts';

export interface IWebSocketFactory {
    new(endpoint: string, protocol?: string): WebSocket;
}

export class WebSocketTransport implements ITransport {

    constructor(
        public name: string,
        private ws: WebSocket,
        private serializer: ISerializer,
        private cb: TransportEventCallback,
    ) {
    }
    open(): void {
        this.ws.onopen = () => this.cb({
            type: TransportEventType.OPEN,
        });

        this.ws.onmessage = event => {
            try {
                const message = this.serializer.unserialize(event.data);
                this.cb({
                    type: TransportEventType.MESSAGE,
                    message,
                });
            } catch (error) {
                this.cb({
                    type: TransportEventType.ERROR,
                    error,
                });
            }
        };
        this.ws.onclose = event => {
            this.ws!.onerror = null;
            this.ws!.onclose = null;
            this.cb({
                type: TransportEventType.CLOSE,
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
            });
        };
        this.ws.onerror = (err: any) => {
            this.ws!.onerror = null;
            this.ws!.onclose = null;
            this.cb({
                type: TransportEventType.ERROR,
                error: `Transport error: ${err.error}`,
            });
        };
    }
    close(code: number = 1000, reason: string = ''): void {
        if (this.ws && this.cb) {
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close(code, reason);
            this.cb({
                type: TransportEventType.CLOSE,
                code,
                reason,
                wasClean: true,
            });
        }
    }
    send(message: string): void {
        this.ws!.send(message);
    }
}
