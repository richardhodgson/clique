#!/bin/env node
/*
This should really just invoke Proton (use.no.de/proton) however it doesn't
work with node v6.
@see https://github.com/usenode/proton.js/issues/5
*/
var jsgi     = require('jsgi'),
    http     = require('http'),
    WebApp   = require('./lib/webapp').WebApp;

var options = {
    'bindTo': process.env.OPENSHIFT_INTERNAL_IP || '0.0.0.0',
    'port'  : process.env.OPENSHIFT_INTERNAL_PORT || 8090
};

var webapp = new WebApp();

var server = http.createServer(
    new jsgi.Listener(function (request) {
        return webapp.handle(request);
    })
);

server.listen(options.port || 80, options.bindTo);

console.log(
    'Webapp listening on ' +
    (options.bindTo || '0.0.0.0') +
    ':' +
    (options.port || 80)
);
