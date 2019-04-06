import * as assert from 'assert';
import * as chaistring from 'chai-string';
import { retinate } from '../commands';
import { expect, use } from 'chai';

use(chaistring);

suite("Extension Tests", () => {

    test("Malformed Script", () => {
        return retinate('retina-scripts/syntax-error.ret', 'foobar').then(() => {
            assert.fail("Failure expected");
        }, ({ message, log }) => {
            expect(message).to.startWith('Retina failed to run');
            expect(log).to.contain('Not enough )');
        });
    });

});