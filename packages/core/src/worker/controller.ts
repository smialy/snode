import {
    ITransportHandler,
    IRealm,
    ISession,
    ISocketContext,
    IWebServerEngineFactory,
    IWebServerEngine,
    MessageType,
    MessageTypes,
} from '@snode/common';
import { IWorkerController, IAuthProvider, IBridge, IBridgeTransport } from '../types';
import { Session, Realm } from '../router/index';
import { AuthProvider } from '../auth';
import { NatsBridge } from '../bridge/nats';
import { PrefixBridge } from '../bridge/bridge';
import { WebServer } from './server';
import { SocketControllers } from './sockets';

class Events {
    onConnect(context: ISocketContext, session: ISession) {

    }
    onDisconnect(context: ISocketContext, session: ISession) {

    }
}


export class WorkerController implements IWorkerController {

    readonly auth: IAuthProvider = new AuthProvider(this);
    private realms: Map<string, Realm> = new Map();
    private bridge: IBridgeTransport = new NatsBridge();
    private server: WebServer;
    public readonly sockets: SocketControllers;
    constructor(
        engineFactory: IWebServerEngineFactory,
        private readonly properties: any,
    ) {
        this.server = new WebServer(this, engineFactory);
        this.sockets = new SocketControllers(this.server);
    }
    async open() {
        await this.bridge.connect();
        await this.server.open();
    }
    async close() {
        await this.server.close();
        await this.bridge.close();
    }

    addWebController(controller: any): () => void {
        return this.server.addRoutes(controller);
    }
    addSocketController(controller: any): () => void {
        return this.sockets.add(controller);
    }
    async createRealm(realmName: string, options: any = {}) {
        if (this.realms.has(realmName)) {
            throw new Error(`Could not create realm: '${realmName}'. It is already created.`);
        }
        const realm = new Realm(this, new PrefixBridge(this.bridge, realmName), realmName, options);
        this.realms.set(realmName, realm);
    }
    async removeRealm(realmName: string) {
        if (!this.realms.has(realmName)) {
            throw new Error(`Could not remove realm: '${realmName}'. Not exists.`);
        }
        const realm = this.realms.get(realmName);
        await realm.close();
        this.realms.delete(realmName);
    }
    hasRealm(name: string): boolean {
       return this.realms.has(name);
    }
    getRealm(name: string): IRealm {
        if (this.realms.has(name)) {
            return this.realms.get(name);
        }
        throw new Error('Missing realm');
    }
    // createRole(realmName: string, roleName: string, config: any): void {
    //     this.realms.get(realmName).createRole(roleName, config);
    // }
    // removeRole(realmName: string, roleName: string): void {
    //     this.realms.get(realmName).removeRole(roleName);
    // }
}