var litmus = require('litmus');

exports.test = new litmus.Test('Webapp', function () {
    var test = this;

    var WebApp = require('../lib/webapp').WebApp;

    test.async('test home page', function (complete) {

        var clique  = new WebApp(),
            request = new mockRequest('GET', '/');

        clique.handle(request).then(function (response) {
            test.is(response.status, 200, 'Page is found');
            test.like(response.body[0], /clique/i, 'Page renders something');
            complete.resolve();
        });

    });
});



/**
* Mock a JSGI request object
* @param method e.g 'GET', 'POST' etc
* @param url The url that was called e.g. '/some/path'
* @param body An object of body params (use with POST)
*/
function mockRequest (method, url, body) {
    var request      = {};
    request.method   = method;
    request.pathInfo = url;
    
    if (body) {
        var param, params = [];
        for (param in body) {
            params.push(param + '=' + body[param]);
        }
        
        params = params.join("&");
        
        request.body = {};
        request.body.forEach = function (callback) {
            var done = new Promise;
            callback(params);
            done.resolve();
            return done;
        };
    }
    
    return request;
}
