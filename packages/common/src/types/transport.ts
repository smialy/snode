
export interface IMessage {
    serialize(): any;
}

type TransportEventOpen = {
    type: string,
}
type TransportEventMessage = {
    type: string,
    message: any,
}
type TransportEventClose = {
    type: string,
    code: number;
    reason: string;
    wasClean: boolean,

}
type TransportEventError = {
    type: string,
    error: string,
};

export type TransportEvent =
    TransportEventOpen |
    TransportEventMessage |
    TransportEventClose |
    TransportEventError;

export type TransportEventCallback = (event: TransportEvent) => void;

export interface ITransport {
    send(message: any): void;
    close(code?: number, reason?: string): void;
}