import * as assert from 'assert';
import * as chaistring from 'chai-string';
import { retinate, retinateFromString } from '../commands';
import { expect, use } from 'chai';

use(chaistring);

suite("Extension Tests", () => {

    test("Syntax Error Script", () => {
        return retinate(__dirname + '/retina-scripts/syntax-error.ret', 'foobar').then(() => {
            assert.fail("Failure expected");
        }, ({ message, log }) => {
            expect(message).to.startWith('Retina failed to run');
            expect(log).to.contain('Not enough )');
        });
    });

    test("Busy Writer Script", () => {
        return retinate(__dirname + '/retina-scripts/busy-writer.ret', 'foobar').then((result) => {
            console.log(result);
            assert.fail("Failure expected");
        }, ({ message, log }) => {
            expect(message).to.startWith('Retina aborted');
            expect(log).to.contain('exceeding maximum output size');
        });
    });

    test("Timeout Script", () => {
        return retinate(__dirname + '/retina-scripts/timeout.ret', 'foobar').then(() => {
            assert.fail("Failure expected");
        }, ({ message, log }) => {
            expect(message).to.startWith('Retina aborted');
            expect(log).to.contain('due to timeout');
        });
    }).timeout('5 seconds');

    test("Syntax Error In Temporary File", () => {
        return retinateFromString('(', 'foobar').then(() => {
            assert.fail("Failure expected");
        }, ({ message, log }) => {
            expect(message).to.startWith('Retina failed to run');
            expect(log).to.contain('Not enough )');
        });
    });
});
