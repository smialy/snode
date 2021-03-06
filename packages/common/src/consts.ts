export const MessageTypes = {
    HELLO: 'hello',
    WELCOME: 'welcome',
    ABORT: 'abort',
    CHALLENGE: 'challenge',
    AUTHENTICATE: 'authenticate',
    GOODBYE: 'goodbye',
    ERROR: 'error',
    PUBLISH: 'publish',
    PUBLISHED: 'published',
    SUBSCRIBE: 'subscribe',
    SUBSCRIBED: 'subscribed',
    UNSUBSCRIBE: 'unsubscribe',
    UNSUBSCRIBED: 'unsubscribed',
    EVENT: 'event',
    CALL: 'call',
    CANCEL: 'cancel',
    RESULT: 'result',
    REGISTER: 'register',
    REGISTERED: 'registered',
    UNREGISTER: 'unregister',
    UNREGISTERED: 'unregistered',
    INVOCATION: 'invocation',
    INTERRUPT: 'interrupt',
    YIELD: 'yield',
};

export enum TransportEventType {
    OPEN ='open',
    CLOSE = 'close',
    ERROR = 'error',
    MESSAGE = 'message',
};
