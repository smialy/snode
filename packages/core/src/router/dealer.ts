import { ISession } from '@snode/common';
import { Router } from './router';

export class Dealer {
    constructor(private router: Router) {}

    attach(session: ISession) {

    }
    detach(session: ISession) {

    }
    async close() {
    }
}
