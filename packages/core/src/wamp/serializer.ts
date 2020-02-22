import { ISerializer, MessageTypes } from "@snode/common";
import { WampMessageTypes } from './consts';
import { Messages } from "../message";

const SERIALIZE = {
    [MessageTypes.WELCOME]: ({ session, details }) => [
        WampMessageTypes.WELCOME,
        session,
        {
            roles: {
                broker: {},
                dealer: {},
            },
            ...details
        },
    ],
    [MessageTypes.GOODBYE]: ({ reason, message }) => {
        const details: any = {};
        if (message) {
            details.message = message;
        }
        return [WampMessageTypes.GOODBYE, details, reason];
    },
    [MessageTypes.ABORT]: ({ reason, message }) => {
        const details: any = {};
        if (message) {
            details.message = message;
        }
        return [WampMessageTypes.ABORT, details, reason];
    },
    [MessageTypes.CHALLENGE]: ({ method, extra }) => [
        WampMessageTypes.CHALLENGE, method, extra
    ],
    [MessageTypes.SUBSCRIBED]: ({ request, subscription }) => [
        WampMessageTypes.SUBSCRIBED, request, subscription
    ],
    [MessageTypes.UNSUBSCRIBED]: ({ request }) => [
        WampMessageTypes.UNSUBSCRIBED, request
    ],
    [MessageTypes.PUBLISHED]: ({ request, publication }) => [
        WampMessageTypes.PUBLISHED, request, publication
    ],
    [MessageTypes.EVENT]: ({ subscription, publication, details, args  }) => [
        WampMessageTypes.EVENT,
        subscription,
        publication,
        details,
        args,
    ],
};
const UNSERIALIZE = {
    [WampMessageTypes.HELLO]: ([ realm, details ]) => Messages.Hello(realm, {
        authid: details.authid,
        authmethods: details.authmethods,
    }),
    [WampMessageTypes.GOODBYE]: ([ details, reason ]) => Messages.Goodbye(reason, details.message),
    [WampMessageTypes.ABORT]: ([ details, reason ]) => Messages.Abort(reason, details.message),
    [WampMessageTypes.AUTHENTICATE]: ([ signature, extra ]) => Messages.Authenticate(signature, extra),
    [WampMessageTypes.SUBSCRIBE]: ([request, options, topic]) => Messages.Subscribe(request, topic, options),
    [WampMessageTypes.PUBLISH]: ([request, options, topic, args]) => Messages.Publish(request, topic, args, options),
    [WampMessageTypes.UNSUBSCRIBE]: ([request, subscription]) => Messages.Unsubscribe(request, subscription),
};

export class WampJsonSerializer implements ISerializer {
    type: string = 'wamp.2.json';

    serialize(message: any): any {
        const payload = SERIALIZE[message.type](message);
        return JSON.stringify(payload);
    }
    unserialize(payload: string): any {
        const data = JSON.parse(payload);
        const type = data.shift();
        return UNSERIALIZE[type](data);
    }
}
