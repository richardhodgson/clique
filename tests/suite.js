var litmus = require('litmus');

exports.test = new litmus.Suite('Clique Test Suite', [
    require('./model/module').test,
    require('./model/package').test,
    require('./webapp').test,
    require('./clique').test
]);
