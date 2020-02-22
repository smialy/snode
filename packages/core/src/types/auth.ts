import { ISession } from '@snode/common';

export type DenyType = {
    readonly type: string;
    readonly message: string;
}

export type AcceptType = {
    readonly type: string;
    readonly realm: string;
    readonly authid: string,
    readonly authrole: string,
    readonly authmethod: string,
    readonly extra: any;
}

export type AuthSignature = AcceptType | DenyType;

export type AuthDetails = {
    authid: string;
    authrole: string;
    authmethods: string[];
};

export interface IAuthProvider {
    getResolver(methods: string[]): IAuthResolver;
    addResolver(resolver: IAuthResolver): void;
    removeResolver(resolver: IAuthResolver): void;
};

export interface IAuthResolver {
    readonly method: string;

    hello(realm: string, details: AuthDetails): Promise<AuthSignature>;
    challenge(singnature: string, extra: any): Promise<AuthSignature>;
};

export interface IAuthorizer {
    authorize(session: ISession, uri: string, action: string, options: any): Promise<boolean>;
}