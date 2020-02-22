import { ITransport } from "./transport";

export interface ITransportHandler {
    onOpen(transport: ITransport): void;
    onClose(code: number, reason: string): void;
    onMessage(message: any): void;
    onError(error: any): void
}

export interface ITransportHandlerFactory {
    create(): ITransportHandler;
}