import { getLogger } from '@stool/logging';
import {
    MessageTypes,
    MessageType,
    HelloMessageType,
    AuthenticateMessageType,
    ISession,
    ITransportHandler,
    SessionDetailsType,
} from '@snode/common';
import {
    IRouterTransport,
    IAuthResolver,
    DenyType,
    AcceptType,
} from '../types';
import { AuthStatus } from '../consts';
import { Messages } from '../message';

import { Realm, Router } from './router';

const logger = getLogger('@snode/core.router.session');

const randomId = () => Math.floor(Math.random() * 9007199254740992);

export class Session implements ISession, ITransportHandler {

    private sessionId: number = null;
    private transport: IRouterTransport;
    private realm: Realm;
    private authResolver: IAuthResolver;
    private _details: SessionDetailsType;

    constructor(private controller) {}

    get id(): number {
        return this.sessionId;
    }
    get details(): SessionDetailsType {
        return this._details;
    }
    onOpen(transport: IRouterTransport): void {
        this.transport = transport;
    }
    async onClose(code: number, reason: string): Promise<void> {
        if (this.realm) {
            await this.realm.detach(this);
            this.realm = null;
        }
        this.sessionId = null;
        this._details = null;
        this.transport = null;
    }
    async onMessage(message: MessageType): Promise<void> {
        if (this.sessionId === null) {
            if (message.type === MessageTypes.HELLO) {
                await this.hello(message as HelloMessageType);
            } else if (message.type === MessageTypes.AUTHENTICATE) {
                await this.authenticate(message as AuthenticateMessageType);
            } else if (message.type === MessageTypes.ABORT) {
                this.authResolver = null;
                // this.transport.close();
            }
        } else {
            if (message.type === MessageTypes.HELLO) {
                throw new Error('Received HELLO message after session was established.');
            }
            if (message.type === MessageTypes.GOODBYE) {
                this.close();
            } else {
                await this.realm.router.process(this, message);
            }
        }
    }
    onError(error: any): void {
    }

    close(reason: string = 'wamp.close.goodbye_and_out'): void {
        this.send(Messages.Goodbye(reason));
        this.transport.close();
    }
    private async hello(message: HelloMessageType): Promise<void> {
        const { realm, details } = message;
        if (!realm) {
            this.send(Messages.NoSushRealm('Missing realm name.'));
            this.transport.close();
            return;
        }
        if (!this.controller.hasRealm(realm)) {
            this.send(Messages.NoSushRealm(`Realm not exists`));
            this.close();
            return;
        }
        const resolver = this.controller.auth.getResolver(details.authmethods);
        const result = await resolver.hello(realm, details);
        switch (result.type) {
            case AuthStatus.ACCEPT:
                this.welcome(result as AcceptType);
                break;
            case AuthStatus.CHALLENGE:
                this.authResolver = resolver;
                this.send(Messages.Challenge(result.authmethod, result.extra));
                break;
            case AuthStatus.DENY:
                this.send(Messages.NotAuthorized(result.message));
                this.transport.close();
                break;
        }
    }
    private async authenticate(message: AuthenticateMessageType) {
        if (this.authResolver) {
            const result = await this.authResolver.challenge(message.signature, message.extra);
            switch(result.type) {
                case AuthStatus.ACCEPT:
                    await this.welcome(result as AcceptType);
                    break;
                case AuthStatus.DENY:
                    this.send(Messages.NotAuthorized((result as DenyType).message));
                    this.transport.close();
                    break;
            }
        } else {
            this.send(Messages.NotAuthorized('No pending authentication'));
            this.transport.close();
        }
    }
    private async welcome(signature: AcceptType) {
        this.realm = this.controller.getRealm(signature.realm);
        this.sessionId = randomId();
        this._details = Object.freeze({
            realm: signature.realm,
            authid: signature.authid,
            authmethod: signature.authmethod,
        });
        this.send(Messages.Welcome(this.sessionId));
        await this.realm.attach(this);
    }
    send(message: MessageType): void {
        this.transport.send(message);
    }
    toString() {
        return `[Session id=${this.id}]`;
    }
}
