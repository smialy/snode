import * as http from 'http';
import Koa from 'koa';
import KoaRouter from '@koa/router';
import websocket from 'ws';
import {
    IWebServerEngineFactory,
    IWebServerEngine,
    WebRouteType,
    ServerOptionsType,
    AddressInfoType,
    MiddlewareType,
} from '@snode/common';

import { CONNECTION_EVENT, ERROR_EVENT } from './consts';

class KoaServerEngine implements IWebServerEngine {

    private app: Koa;
    private router: KoaRouter;
    private wss: websocket.Server;
    private server: http.Server;

    constructor(private options: ServerOptionsType) {
        // this.app.use(koaBody());
    }
    start() {
        this.app = new Koa();
        this.router = new KoaRouter();
        this.app.use(this.router.routes());

        const server = http.createServer(this.app.callback());
        return new Promise((resolve, reject) => {
            this.server = server;
            if (this.options.websocket) {
                this.wss = new websocket.Server({
                    server
                });
            }
            server.listen(this.options.port, this.options.host, () => {
                let { address, port } = this.server.address() as AddressInfoType;
                resolve({ address, port, server });
            });
            server.on('error', error => {
                console.log({error})
                reject(error);
            });
            server.on('close', err => {
                console.log(err);
            });
            // this.prepareGracefulExit();
        });
    }

    stop() {
        this.server.getConnections((err, count) => {
            console.log({err, count});
        });
        return new Promise((resolve, reject) => {
            this.wss.close(error => {
                if (error) {
                    reject(error);
                }
                this.server.close(error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    use(middleware: MiddlewareType): () => void {
        this.app.use(middleware);
        return () => removeFromArray(this.app.middleware, middleware);
    }
    route(route: WebRouteType): () => void {
        print('add route', route);
        const { path, method, handler } = route;
        const item = this.router.register(path, [method], handler);
        return () => removeFromArray(this.router.stack, item);
    }
    socket(listener: (request: any, ws: any) => void) {
        if (this.wss) {
            this.wss.on(CONNECTION_EVENT, listener);
        } else {
            console.warn('WebSocket are disable.');
        }
    }
}

export class KoaServerEngineFactory implements IWebServerEngineFactory {
    create(options: ServerOptionsType): IWebServerEngine {
        return new KoaServerEngine(options);
    }
}

function removeFromArray(list, item) {
    const index = list.indexOf(item);
    if (index !== -1) {
        this.router.stack.splice(index, 1);
    }
}