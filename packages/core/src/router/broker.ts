import {
    ISession,
    MessageTypes,
    MessageType,
    PublishMessageType,
    SubscribeMessageType,
    UnsubscribeMessageType
} from '@snode/common';
import { Router } from './router';
import { Errors } from '../consts';
import { Messages } from '../message';

interface ISubscription {
    id: number,
    uri: string;
    hasSession(session: ISession): boolean;
    addSession(session: ISession): void;
    deleteSession(session: ISession): void;
    size(): number;
    clients(): ISession[];
    dispose(): void;
}

class Subscription implements ISubscription {

    private sessions: Set<ISession> = new Set();

    constructor(readonly id: number, readonly uri: string) {

    }
    hasSession(session: ISession): boolean {
        return this.sessions.has(session);
    }
    addSession(session: ISession): void {
        this.sessions.add(session);
    }
    deleteSession(session: ISession): void {
        this.sessions.delete(session);
    }
    size(): number {
        return this.sessions.size;
    }
    clients(): ISession[] {
        return Array.from(this.sessions);
    }
    dispose() {
        this.sessions.clear();
    }
}

class Subscriptions {
    private nextId: number = 1;
    private subscriptionsUriMap: Map<string, ISubscription> = new Map();
    private subscriptionsMap: Map<number, [ISubscription, Function]> = new Map();

    constructor(private broker: Broker) {

    }
    add(session: ISession, message: PublishMessageType, unsubscribeHook: Function): ISubscription {
        if (!this.subscriptionsUriMap.has(message.topic)) {
            const subscription = new Subscription(this.getNextId(), message.topic);
            this.subscriptionsUriMap.set(message.topic, subscription);
            this.subscriptionsMap.set(subscription.id, [subscription, unsubscribeHook]);
        }
        const subscription = this.subscriptionsUriMap.get(message.topic);
        subscription.addSession(session);
        return subscription;
    }
    getById(subscriptionId: number): ISubscription {
        return this.subscriptionsMap.get(subscriptionId)[0];
    }
    async remove(subscription: ISubscription) {
        const [sub, unsubscribe] = this.subscriptionsMap.get(subscription.id);
        if (sub) {
            sub.dispose();
        }
        if (unsubscribe) {
            await unsubscribe();
        }
        this.subscriptionsUriMap.delete(subscription.uri);
        this.subscriptionsMap.delete(subscription.id);
    }
    search(uri: string, options: any={}): ISubscription[] {
        if (this.subscriptionsUriMap.has(uri)) {
            return [this.subscriptionsUriMap.get(uri)];
        }
        return [];
    }
    private getNextId(): number {
        if (this.nextId >= Number.MAX_SAFE_INTEGER) {
            this.nextId = 1;
        }
        return this.nextId += 1;
    }
    async dispose() {
        for(const [subscription, _] of this.subscriptionsMap.values()) {
            await this.remove(subscription);
        }
    }
}

export class Broker {
    private sessions: Map<number, Set<ISubscription>> = new Map();
    private subscriptions: Subscriptions = new Subscriptions(this);
    private nextPublishId: number = 1;

    constructor(private router: Router) {

    }
    async attach(session: ISession): Promise<void> {
        this.sessions.set(session, new Set());
    }
    async detach(session: ISession) {
        for (const subscription of this.sessions.get(session)) {
            await this.subscriptions.remove(subscription);
        }
        this.sessions.delete(session);
    }
    async publishMessage(message: PublishMessageType) {
        await this.router.bridge.publish(message.topic, {
            sender: 0,
            message,
        });
    }
    private publishSubscription(subscription: ISubscription, message: PublishMessageType, sender: number) {
        const uniqueRecipient: Set<ISession> = new Set<ISession>();
        const includeMe = message.options.exclude_me === false;
        const publication = this.getNextPublishId();
        const clients = subscription.clients();
        const recipients = this.filterRecipients(message, clients);
        for (const recipient of recipients) {
            if (!uniqueRecipient.has(recipient)) {
                uniqueRecipient.add(recipient);
                if (includeMe || recipient.id !== sender) {
                    recipient.send(Messages.Event(subscription.id, publication, message.args, {}));
                }
            }
        }
    }
    async process(session: ISession, message: MessageType) {
        switch(message.type) {
            case MessageTypes.PUBLISH:
                await this.processPublish(session, message as PublishMessageType);
                break;
            case MessageTypes.SUBSCRIBE:
                await this.processSubscribe(session, message as SubscribeMessageType);
                break;
            case MessageTypes.UNSUBSCRIBE:
                await this.processUnsubscribe(session, message as UnsubscribeMessageType);
                break;
            }
    }
    async close() {
        this.subscriptions.dispose();
    }
    private async processPublish(session: ISession, message: PublishMessageType) {
        if (await this.router.realm.onPublish(session, message)) {
            return;
        }
        await this.router.bridge.publish(message.topic, {
            sender: session.id,
            message,
        });
        const publication = this.getNextPublishId();
        if (message.options.acknowledge) {
            session.send(Messages.Published(message.request, publication));
        }
    }
    private async processSubscribe(session: ISession, message: SubscribeMessageType) {
        const unsubscribe = await this.router.bridge.subscribe(message.topic, payload => {
            const { sender, message } = payload;
            this.publishSubscription(subscription, message, sender);
        });
        const subscription = this.subscriptions.add(session, message, unsubscribe);
        this.sessions.get(session).add(subscription);
        session.send(Messages.Subscribed(message.request, subscription.id));
    }
    private async processUnsubscribe(session: ISession, message: UnsubscribeMessageType) {
        const subscription = this.subscriptions.getById(message.subscription);
        if (subscription && subscription.hasSession(session)) {
            subscription.deleteSession(session);
            if (subscription.size() === 0) {
                await this.subscriptions.remove(subscription);
            }
            const reply = Messages.Unsubscribed(message.request);
            session.send(reply);
        } else {
            const reply = Messages.Error(message.request, MessageTypes.UNSUBSCRIBE, Errors.NO_SUCH_SUBSCRIPTION);
            session.send(reply);
        }
    }
    private getNextPublishId(): number {
        if (this.nextPublishId >= Number.MAX_SAFE_INTEGER) {
            this.nextPublishId = 1;
        }
        return this.nextPublishId += 1;
    }
    private filterRecipients(message: PublishMessageType, recipients: ISession[]): ISession[] {
        if (message.options) {
            const options = message.options || {};
            if (options.include) {
                recipients = recipients.filter(recipient => message.options.include.includes(recipient.id));
            }
            if (options.exclude) {
                recipients = recipients.filter(recipient => !message.options.exclude.includes(recipient.id));
            }
        }
        return recipients;
    }
}
