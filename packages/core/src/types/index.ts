import { ISession, ISocketContext, PublishMessageType } from '@snode/common';
import { IAuthProvider } from './auth';

export * from './auth';
export * from './router';
export * from './bridge';

export interface ISockets {
    onConnect(context: ISocketContext, session: ISession): Promise<void>;
    onDisconnect(context: ISocketContext, session: ISession): Promise<void>;
    onPublish(context: ISocketContext, session: ISession, message: PublishMessageType): Promise<boolean>;
}

export interface IWorkerController {
    auth: IAuthProvider;
    sockets: ISockets;
    hasRealm(name: string): boolean;
    createRealm(realmName: string, options?: any): Promise<void>;
    removeRealm(realmName: string): Promise<void>;
}

export interface ICloseable {
    close(): Promise<void>;
}
