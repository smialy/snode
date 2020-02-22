import "reflect-metadata";

export const MetadataControllerKeys = {
    WEB_CONTROLLER: 'snode.web.controller',
    WEB_HANDLER: 'snode.web.handler',
    SOCKET_CONTROLLER: 'snode.socket.controller',
    SOCKET_HANDLER: 'snode.socket.subscribe',
}

export enum SocketHandlerType {
    INIT = 'init',
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    PUBLISH = 'publish',
    SUBSCRIBE = 'subscribe',
};
export type SocketHandlerMetadata = {
    type: SocketHandlerType,
    topic?: string,
    scope?: string,
};

const createHandlerMethod = (method: string) => (path: string='') =>
    (target, name, descriptor: PropertyDescriptor) =>
        Reflect.defineMetadata(MetadataControllerKeys.WEB_HANDLER, { path, method }, descriptor.value);

const createSocketHandler = (type: SocketHandlerType) => (options: any) =>
    (target, name, descriptor: PropertyDescriptor) =>
        Reflect.defineMetadata(MetadataControllerKeys.SOCKET_HANDLER, { type, options }, descriptor.value);

export const Controller = (path: string, scope: string="default"): ClassDecorator =>
    (target: object) => Reflect.defineMetadata(MetadataControllerKeys.WEB_CONTROLLER, { path, scope }, target);

export const Get = createHandlerMethod('GET');
export const Post = createHandlerMethod('POST');
export const Patch = createHandlerMethod('PATCH');
export const Delete = createHandlerMethod('DELETE');
export const All = createHandlerMethod('ALL');
export const Head = createHandlerMethod('HEAD');
export const Options = createHandlerMethod('OPTIONS');

export const SocketController = (scope: string="default"): ClassDecorator => (target: object) =>
    Reflect.defineMetadata(MetadataControllerKeys.SOCKET_CONTROLLER, { scope }, target);

export const OnInit = createSocketHandler(SocketHandlerType.INIT);
export const OnConnect = createSocketHandler(SocketHandlerType.CONNECT);
export const OnDisconnect = createSocketHandler(SocketHandlerType.DISCONNECT);
export const OnSubscribe = createSocketHandler(SocketHandlerType.SUBSCRIBE);
export const OnPublish = createSocketHandler(SocketHandlerType.PUBLISH);