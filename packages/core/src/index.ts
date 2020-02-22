import { IBundleContext } from '@odss/common';
import {
    WebServerEngineFactory,
    IWebRequest,
    IWebSocket,
    IWebServerEngine,
    JSONSerializer,
} from '@snode/common'

import { WebSocketServerTransport } from './transport';
import { WampProtocol } from './wamp/protocol';

export class Activator {
    private reference;
    private engine: IWebServerEngine;
    private protocols: ProtocolsListener;

    async start(ctx: IBundleContext){
        const props = ctx.getProperty('snode', null);

        this.reference = ctx.getServiceReference(WebServerEngineFactory, {name: props.engine});
        const serverFactory = ctx.getService(this.reference);

        this.engine = serverFactory.create(props);
        // this.protocols = new ProtocolsListener();

        // ctx.serviceTracker(ServerTransportFactoryService, this.transports).open();

        console.log('startng...');
        const info = await this.engine.start();
        console.log('started: %s:%s', info.address, info.port);
        this.engine.socket((request, socket) => {
            new WebSocketServerTransport(socket, new JSONSerializer(), new WampProtocol(cb));
        });
    }
    async stop(ctx: IBundleContext) {
        ctx.ungetService(this.reference);
        // this.protocols.reset();
        await this.engine.stop();
    }
}

class ProtocolsListener {
    private transports: Set<any> = new Set();
    createSessionListener() {
        return (request: IWebRequest, socket: IWebSocket) => {
            try {

                // const protocolFactory = this.transports.getProtocol(request);
                // const session = transport.createSession(socket);
            } catch(e) {
                console.error(e);
                socket.close();
            }
        }
    }
    addingService(transport: any): void {
        this.transports.add(transport);
    }
    modifiedService(service: any): void {

    }

    removedService(transport: any): void {
        this.transports.delete(transport);
    }

    createTransport(request: IWebRequest, socket: IWebSocket): any {
        const transportFactory = this.getTransportFactory(request);
        return transportFactory.create(request, socket);
    }
    reset() {
        this.transports.clear();
    }
    private getTransportFactory(request: IWebRequest): any {
        const protocols = this.getRequestProtocols(request);
        for (const protocol of protocols) {
            for (const transport of this.transports) {
                if (transport.match(protocol)) {
                    return transport;
                }
            }
        }
        throw new Error(`Not found transport: ${protocols}`);
    }
    private getRequestProtocols(request: IWebRequest) {
        let protocol = request.headers['sec-websocket-protocol'];
        if (protocol) {
            const names = protocol.split(',')
                .map(protocol => protocol.trim())
                .filter(protocol => protocol);
            if (names.length > 0) {
                return names;
            }
        }
        return [];
    }
}