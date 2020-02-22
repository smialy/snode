import { ISession } from '@snode/common';
import {
    IAuthorizer,
    IAuthProvider,
    IAuthResolver,
    AuthSignature,
    AuthDetails,
    IWorkerController,
} from './types';
import { AuthStatus } from './consts';

export class AuthProvider implements IAuthProvider {

    private resolvers: Map<string, IAuthResolver> = new Map();
    private authorizer: IAuthorizer;
    private defaultAuthorize = false;

    constructor(private controller: IWorkerController) {}
    getResolver(authmethods: string[]): IAuthResolver {
        const methods = [...this.resolvers.keys()];
        for (const method of methods) {
            if (authmethods.includes(method)) {
                return this.resolvers.get(method);
            }
        }
        throw new Error(`Not found authmethod resolver`);
    }
    addResolver(resolver: IAuthResolver) {
        this.resolvers.set(resolver.method, resolver);
    }
    removeResolver(resolver: IAuthResolver) {
        this.resolvers.delete(resolver.method);
    }
    setAuthorizer(authorizer: IAuthorizer) {
        this.authorizer = authorizer;
    }
    authorize(session: ISession, uri: string, action: string, options: any): Promise<boolean> {
        if (this.authorizer) {
            return this.authorizer.authorize(session, uri, action, options);
        }
        return Promise.resolve(this.defaultAuthorize);
    }
}

export class TicketAuthResolver implements IAuthResolver {
    public method: string = 'ticket';

    private realm: string;
    private details: AuthDetails;

    constructor(private token: string) {

    }
    hello(realm: string, details: AuthDetails): Promise<AuthSignature> {
        this.realm = realm;
        this.details = details;
        return Promise.resolve({
            type: AuthStatus.CHALLENGE,
            realm: this.realm,
            authid: this.details.authid,
            authrole: this.details.authrole,
            authmethod: this.method,
            extra: {},
        });
    }

    challenge(signature: string, extra: any): Promise<AuthSignature> {
        if (this.realm && this.details) {
            if (signature === this.token) {
                return Promise.resolve({
                    type: AuthStatus.ACCEPT,
                    realm: this.realm,
                    authid: this.details.authid,
                    authrole: this.details.authrole,
                    authmethod: this.method,
                    extra: {},
                });
            }
        }
        return Promise.resolve({
            type: AuthStatus.DENY,
            message: 'Problem with authencticate',
        });
    }
}
