import * as testRunner from 'vscode/lib/testrunner';

// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options
testRunner.configure({
    ui: 'tdd',
    useColors: true,
    timeout: 5000
});

module.exports = testRunner;
