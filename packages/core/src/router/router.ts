import { ISession, MessageTypes, MessageType, ISocketContext, IRealm, PublishMessageType } from '@snode/common';

import { IWorkerController, IBridge, ISockets } from '../types';
import { Messages } from '../message';
import { Broker } from './broker';
import { Dealer } from './dealer';

const BROKER_MESSAGES = [
    MessageTypes.PUBLISH,
    MessageTypes.SUBSCRIBE,
    MessageTypes.UNSUBSCRIBE,
    MessageTypes.EVENT,
];

export class Router {

    private broker: Broker = new Broker(this);
    private dealer: Dealer = new Dealer(this);
    private attached: number = 0

    constructor(readonly realm: Realm, readonly bridge: IBridge) {
    }
    async attach(session: ISession): Promise<void> {
        await this.broker.attach(session);
        await this.dealer.attach(session);
        this.attached += 1
    }
    async detach(session: ISession): Promise<void> {
        await this.broker.detach(session);
        await this.dealer.detach(session);
        this.attached -= 1
    }
    async process(session: ISession, message: MessageType): Promise<void> {
        if (BROKER_MESSAGES.includes(message.type)) {
            await this.broker.process(session, message);
        } else {
            throw new Error('Incorrect message type.');
        }
    }
    async publish(topic: string, args: any, options: any) {
        if (!Array.isArray(args)) {
            args = [args];
        }
        await this.broker.publishMessage(Messages.Publish(0, topic, args, options));
    }
    async close() {
        await this.broker.close();
        await this.dealer.close();
    }
}

class SocketContext implements ISocketContext {
    constructor(readonly realm: IRealm) {

    }

    async publish(topic, args, options): Promise<void> {
        await this.realm.router.publish(topic, args, options);
    };

}

export class Realm implements IRealm {
    private sessions: Set<ISession> = new Set();

    readonly context: ISocketContext = new SocketContext(this);
    readonly router: Router;

    constructor(
        readonly controller: IWorkerController,
        bridge: IBridge,
        readonly name: string,
        private options: any
    ) {
            this.router = new Router(this, bridge);
    }
    async attach(session: ISession) {
        this.sessions.add(session);
        await this.router.attach(session);
        await this.controller.sockets.onConnect(this.context, session);
    }
    async detach(session: ISession) {
        await this.controller.sockets.onDisconnect(this.context, session);
        await this.router.detach(session);
        this.sessions.delete(session);
    }
    async onPublish(session: ISession, message: PublishMessageType): Promise<boolean> {
        return await this.controller.sockets.onPublish(this.context, session, message);
    }

    async close() {
        await this.router.close();
        for (const session of this.sessions) {
            session.close('wamp.close.close_realm');
        }
        this.sessions.clear();
    }
}
