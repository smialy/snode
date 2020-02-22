import { IDealer, IBroker, IUnsubscribe } from './router';
import { ICloseable } from '.';

export interface IBridge extends IDealer, IBroker {
}
export interface IBridgeTransport extends IBridge, ICloseable {
    connect(): Promise<void>;
}
