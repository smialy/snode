import {
    MessageTypes,
    WelcomeMessageType,
    GoodbyeMessageType,
    HelloMessageType,
    HelloMessageDetailsType,
    ChallengeMessageType,
    AbortMessageType,
    PublishMessageType,
    PublishedMessageType,
    AuthenticateMessageType,
    SubscribeMessageType,
    SubscribedMessageType,
    UnsubscribeMessageType,
    UnsubscribedMessageType,
    EventMessageType,
    ErrorMessageType,
} from '@snode/common';
import { Errors } from './consts';

export const Messages = {
    Hello: (realm: string, details: HelloMessageDetailsType): HelloMessageType => ({
        type: MessageTypes.HELLO,
        realm,
        details,
    }),
    Welcome: (session: number, details: object = {}): WelcomeMessageType => ({
        type: MessageTypes.WELCOME,
        session,
        details,
    }),
    Goodbye: (reason: string, message: string=''): GoodbyeMessageType => ({
        type: MessageTypes.GOODBYE,
        reason,
        message,
    }),
    Challenge: (method: string, extra: any = {}): ChallengeMessageType => ({
        type: MessageTypes.CHALLENGE,
        method,
        extra,
    }),
    Authenticate: (signature: string, extra: any = {}): AuthenticateMessageType => ({
        type: MessageTypes.AUTHENTICATE,
        signature,
        extra,
    }),
    Abort: (reason: string, message: string = ''): AbortMessageType => ({
        type: MessageTypes.ABORT,
        message,
        reason,
    }),
    Publish: (request: number, topic: string, args: any[] = [], options: any = {}): PublishMessageType => ({
        type: MessageTypes.PUBLISH,
        topic,
        args,
        request,
        options,
    }),
    // InternalPublish: (topic: string, args: any[] = [], options: any = {}): PublishMessageType => ({
    //     type: MessageTypes.PUBLISH,
    //     topic,
    //     args,
    //     request: 0,
    //     options,
    //     internal: true,
    // }),
    Published: (request: number, publication: number): PublishedMessageType => ({
        type: MessageTypes.PUBLISHED,
        request,
        publication,
    }),
    Subscribe: (request: number, topic: string, options: any = {}): SubscribeMessageType => ({
        type: MessageTypes.SUBSCRIBE,
        topic,
        request,
        options,
    }),
    Subscribed: (request: number, subscription: number): SubscribedMessageType => ({
        type: MessageTypes.SUBSCRIBED,
        request,
        subscription,
    }),
    Unsubscribe: (request: number, subscription: number): UnsubscribeMessageType => ({
        type: MessageTypes.UNSUBSCRIBE,
        request,
        subscription,
    }),
    Unsubscribed: (request: number): UnsubscribedMessageType => ({
        type: MessageTypes.UNSUBSCRIBED,
        request,
    }),
    Event: (subscription: number, publication: number, args: any[], details: any = {}): EventMessageType => ({
        type: MessageTypes.EVENT,
        subscription,
        publication,
        args,
        details,
    }),
    Error: (request: number, requestType: string, reason: string, message: string=''): ErrorMessageType => ({
        type: MessageTypes.ERROR,
        request,
        requestType,
        reason,
        message,
    }),
    NoSushRealm: (message: string = '', reason: string = Errors.NO_SUCH_REALM) => Messages.Abort(reason, message),
    NotAuthorized: (message: string = '', reason: string = Errors.NOT_AUTHORIZED) => Messages.Abort(reason, message),
};
