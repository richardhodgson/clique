var litmus = require('litmus');

exports.test = new litmus.Suite('Clique Test Suite', [
    require('./model').test,
    require('./webapp').test,
    require('./clique').test
]);
