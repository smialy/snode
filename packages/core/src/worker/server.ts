import {
    ITransportHandler,
    IWebServerEngineFactory,
    IWebServerEngine,
} from '@snode/common';
import { scanForRoutes } from './scanner';
import { IWorkerController } from '../types';
import { Session } from '../router';
import { WebSocketServerTransport } from '../transport';
import { WampJsonSerializer } from '../wamp/serializer';

export class WebServer {

    private engine: IWebServerEngine;
    constructor(
        private controller: IWorkerController,
        private engineFactory: IWebServerEngineFactory,
    ) {

    }
    async open() {
        this.engine = this.engineFactory.create({
            port: findPort(),
            host: '0.0.0.0',
            websocket: true,
        });

        const info = await this.engine.start();
        console.log('Server worker started: %s:%s', info.address, info.port);

        this.engine.socket((socket, request) => {
            // let protocol = request.headers['sec-websocket-protocol'];
            new WebSocketServerTransport(
                socket,
                new WampJsonSerializer(),
                new Session(this.controller),
            ).open();
        });
    }
    async close() {
        await this.engine.close();
    }
    addRoutes(controller: any): () => void {
        const routes = scanForRoutes(controller);
        const toDispose = routes.map(route => this.engine.route(route));
        return () => toDispose.map(dispose => dispose());
    }
}

function findPort() {
    const portOption = process.argv.filter(arg => arg.indexOf('--port=') === 0)[0];
    if (portOption) {
        return parseInt(portOption.substr(7), 10);
    }
    return 8001;
}
