export type HelloMessageDetailsType = {
    readonly authid: string,
    readonly authmethods: Array<string>,
    readonly agent?: string,
    [key: string]: any,
}

export type HelloMessageType = {
    readonly type: string;
    readonly realm: string;
    readonly details: HelloMessageDetailsType;
}

type WelcomeMessageDetailsType = {
    [key: string]: any;
};

export type WelcomeMessageType = {
    readonly type: string;
    readonly session: number,
    readonly details: WelcomeMessageDetailsType,
};

export type AbortMessageType = {
        readonly type: string;
        readonly message: string;
        readonly reason: string;
};

export type GoodbyeMessageType = {
    readonly type: string;
    readonly message: string;
    readonly reason: string;
};

export type ChallengeMessageType = {
    readonly type: string;
    readonly method: string;
    readonly extra: any;
};

export type AuthenticateMessageType = {
    readonly type: string;
    readonly signature: any;
    readonly extra: any;
};

export type ErrorMessageType = {
    readonly type: string;
    readonly requestType: string;
    readonly request: number;
    readonly reason: string;
    readonly message: string;
};

export type PublishMessageType = {
    readonly type: string;
    readonly topic: string;
    readonly args: any[];
    readonly request: number,
    readonly options: any;
};
export type PublishedMessageType = {
    readonly type: string;
    readonly request: number,
    readonly publication: number,
};
export type SubscribeMessageType = {
    readonly type: string;
    readonly topic: string;
    readonly request: number;
    readonly options: any;
}
export type SubscribedMessageType = {
    readonly type: string;
    readonly request: number;
    readonly subscription: number;
}
export type UnsubscribeMessageType = {
    readonly type: string;
    readonly request: number;
    readonly subscription: number;
}
export type UnsubscribedMessageType = {
    readonly type: string;
    readonly request: number;
}
export type EventMessageType = {
    readonly type: string;
    readonly subscription: number,
    readonly publication: number,
    readonly args: any[],
    readonly details: any,
}
export type MessageType =
    HelloMessageType |
    WelcomeMessageType |
    AbortMessageType |
    GoodbyeMessageType |
    ChallengeMessageType |
    AuthenticateMessageType |
    ErrorMessageType |
    PublishMessageType |
    SubscribeMessageType |
    SubscribedMessageType |
    UnsubscribeMessageType |
    UnsubscribedMessageType |
    EventMessageType;
/*

class UnsubscribeMessage implements IMessage {
    readonly type: number = MessageTypes.UNSUBSCRIBE;

    static parse(data: [number, number]): UnsubscribeMessage {
        return new UnsubscribeMessage(data[0], data[1]);
    }
    constructor(
        readonly request: number,
        readonly subscription: number,
    ) {}

    serialize(): WampUnsubscribeMessage {
        return [this.type, this.request, this.subscription];
    }
}

class UnsubscribedMessage implements IMessage {
    readonly type: number = MessageTypes.UNSUBSCRIBED;

    static parse(data): UnsubscribedMessage {
        return new UnsubscribedMessage(data[0]);
    }
    constructor(
        readonly request: number,
    ) {}

    serialize(): WampUnsubscribedMessage {
        return [this.type, this.request];
    }
}

const MESSAGES_TYPE_TO_CLASS = {
    [MessageTypes.HELLO]: HelloMessage,
    [MessageTypes.GOODBYE]: GoodbyeMessage,
    [MessageTypes.ABORT]: AbortMessage,
    [MessageTypes.WELCOME]: WelcomeMessage,
    [MessageTypes.CHALLENGE]: ChallengeMessage,
    [MessageTypes.AUTHENTICATE]: AuthenticateMessage,
    [MessageTypes.ERROR]: ErrorMessage,
    [MessageTypes.SUBSCRIBE]: SubscribeMessage,
    [MessageTypes.SUBSCRIBED]: SubscribedMessage,
    [MessageTypes.UNSUBSCRIBE]: UnsubscribeMessage,
    [MessageTypes.UNSUBSCRIBED]: UnsubscribedMessage,
};

const MESSAGES_TYPES = Object.keys(MESSAGES_TYPE_TO_CLASS).map(num => parseInt(num, 10));

const findMessageClass = type => MESSAGES_TYPE_TO_CLASS[type];

export function parseMessage(payload: Array<any>): IMessage {
    if (!Array.isArray(payload)) {
        throw Error(`Invalid type for WAMP message: ${typeof payload}`);
    }
    const messageType = payload.shift();
    if (!MESSAGES_TYPES.includes(messageType)) {
        throw Error(`Invalid message type for WAMP message: ${messageType}`);
    }
    const MessageClass = findMessageClass(messageType);
    return MessageClass.parse(payload);
}

*/