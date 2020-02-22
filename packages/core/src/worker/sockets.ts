import { ISession, ISocketContext, PublishMessageType } from '@snode/common';
import { WebServer } from './server';
import { scanForSocketRoutes } from './scanner';
import { ISockets } from '../types';

type OptionsType = {
    context?: boolean,
    [key: string]: any,
}
enum HandlerTypes {
    INIT = 'init',
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    PUBLISH = 'publish',
};

type HandlerInfoType = {
    name: string,
    type: HandlerTypes,
    options: OptionsType,
};

class ControllerWrapper {
    private handlers: Map<HandlerTypes, Set<HandlerInfoType>> = new Map();

    constructor(private instance: any, private options: any) {
        this.handlers.set(HandlerTypes.INIT, new Set());
        this.handlers.set(HandlerTypes.CONNECT, new Set());
        this.handlers.set(HandlerTypes.DISCONNECT, new Set());
        this.handlers.set(HandlerTypes.PUBLISH, new Set());
    }
    addHandler(handler: HandlerInfoType) {
        const { type } = handler;
        this.handlers.get(type).add(handler);
    }
    async onConnect(context: ISocketContext, session: ISession): Promise<void> {
        for (const { name } of this.handlers.get(HandlerTypes.CONNECT)) {
            await this.instance[name](context, session);
        }
    }
    async onDisconnect(context: ISocketContext, session: ISession): Promise<void> {
        for (const { name } of this.handlers.get(HandlerTypes.DISCONNECT)) {
            await this.instance[name](context, session);
        }
    }
    async onPublish(context: ISocketContext, session: ISession, message: PublishMessageType): Promise<boolean> {
        let stopPropagate = false;
        for (const { name, options } of this.handlers.get(HandlerTypes.PUBLISH)) {
            if (options.topic && message.topic === options.topic) {
                await this.instance[name](context, session, ...message.args);
                stopPropagate = true;
            }
        }
        return stopPropagate;
    }
}

export class SocketControllers implements ISockets {
    private id: number = 0;
    private controllers: Map<number, ControllerWrapper> = new Map();

    constructor(private server: WebServer) {
    }
    add(controller: any) {
        const { instance, options, handlers } = scanForSocketRoutes(controller);
        const wrapper = new ControllerWrapper(instance, options);
        handlers.forEach(handler => wrapper.addHandler(handler));
        const sid = this.getNextId();
        this.controllers.set(sid, wrapper);
        return () => this.controllers.delete(sid);
    }
    getNextId(): number {
        if (this.id >= Number.MAX_SAFE_INTEGER) {
            this.id = 0;
        }
        return this.id+=1;
    }
    async onConnect(context: ISocketContext, session: ISession): Promise<void> {
        for(const controller of this.controllers.values()) {
            await controller.onConnect(context, session);
        }

    }
    async onDisconnect(context: ISocketContext, session: ISession): Promise<void> {
        for(const controller of this.controllers.values()) {
            await controller.onDisconnect(context, session);
        }
    }
    async onPublish(context: ISocketContext, session: ISession, message: PublishMessageType): Promise<boolean> {
        let stopPropagate = false;
        for(const controller of this.controllers.values()) {
            if (await controller.onPublish(context, session, message)) {
                stopPropagate = true;
            }
        }
        return stopPropagate;
    }
}
