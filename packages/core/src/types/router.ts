import { ITransport } from '@snode/common';

export interface IUnsubscribe {
    (): void;
}
export interface IUnregister {
    (): void;
}

export interface IRouterTransport extends ITransport {
    readonly trusted: boolean;
    send(message: any);
    close();
}

export interface IBroker<T = any> {
    publish(subject: string, data: T): Promise<void>;
    subscribe(subject: string, handler: Function): Promise<IUnsubscribe>;
}

export interface IDealer {
    call(subject: string, args: any[]): Promise<void>;
    register(subject: string, handler: Function): Promise<IUnregister>;
}