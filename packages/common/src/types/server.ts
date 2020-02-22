import { MessageType } from './message';

export interface IWebRequestHeaders {
    [key: string]: string;
}

export interface IWebRequest {
    headers: IWebRequestHeaders;
}

export interface IWebRequest {
    headers: IWebRequestHeaders;
}

export interface IWebSocket {
    send(msg: string): void;
    on(name: string, handler: any): void;
    close(): void;
}

export interface IWebContext {
    request: IWebRequest;
    response: any;
    cookies: object;

    [key: string]: any;
}
export type WebRouteType = {
    name: string,
    path: string,
    method: string,
    handler: Function,
};
export type SocketListenerType = (socket: IWebSocket, request: IWebRequest) => void;

export type WebMiddlewareType = (ctx: IWebContext, next: () => void ) => void;


export interface IWebServerEngine {
    start(): Promise<any>;
    stop(): Promise<any>;
    use(handler: WebMiddlewareType): void;
    routes(routes: WebRouteType[]): void;
    socket(listener: SocketListenerType): void;
}

export interface IWebServerEngineFactory {
    create(options: ServerOptionsType): IWebServerEngine;
}

export type SessionIdType = number | string;

export type SessionDetailsType = {
    readonly realm: string;
    readonly authid: string|number;
    readonly authmethod: string,
    [key: string]: any,
}

export interface ISession {
    readonly id: SessionIdType;
    readonly details: SessionDetailsType;

    close(): void;
    send(message: MessageType): void;

    publish(topic: string, args: any[]): void;
}


export interface ISessions {
    [Symbol.iterator](): Iterable<ISession>;
    subscribed(topic:string, match?: string): Iterable<ISession>;
}

interface ISubscription {
    (): void;
}

interface IRealm {
    router: IRouter;
}
interface IRouter {
}


export interface ISocketContext {
    realm: IRealm;
    sessions: ISessions;

    subscribe(topic: string, listener): ISubscription;
    publish(topic, args): void;

    [key: string]: any;

}

export type ServerOptionsType = {
    port: number;
    host: string;
    websocket: boolean;
    [key: string]: any;
}

export interface AddressInfoType {
    address: string,
    port: number
}
