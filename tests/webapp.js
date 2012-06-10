var litmus  = require('litmus'),
    Promise = require('promised-io/promise').Promise,
    fs      = require('promised-io/fs')

exports.test = new litmus.Test('Webapp', function () {
    var test = this;

    test.plan(9);

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

    test.async('simple package', function (complete) {

        var clique  = new WebApp(),
            request = new mockRequest(
                'GET',
                '/package'
            );

        request.queryString = 'http%3A%2F%2Fwww.example.com%2Fone.js:http%3A%2F%2Fwww.example.com%2Ftwo.js';

        function MockPackage (urls) {
            test.is(
                urls,
                [
                    'http://www.example.com/one.js',
                    'http://www.example.com/two.js'
                ],
                'Webapp passes Package class the urls from the querystring'
            );
        };
        MockPackage.prototype.get = function () {
            var promise = new Promise();
            promise.resolve('response1 response2');
            return promise;
        };

        clique.setPackageClass(MockPackage);

        clique.handle(request).then(function (response) {
            test.is(response.status, 200, 'Page is found');
            test.is(
                response.headers['Content-Type'],
                'application/javascript',
                'Correct mime type is sent'
            );
            test.is(response.body[0], 'response1 response2', 'Response renders package');
            complete.resolve();
        });
    });

    var clique = new WebApp();

    test.is(
        clique.getUrlsFromQuerystring(
            'http%3A%2F%2Fwww.example.com%2Fone.js:http%3A%2F%2Fwww.example.com%2Ftwo.js'
        ),
        [
            'http://www.example.com/one.js',
            'http://www.example.com/two.js'
        ],
        'Can convert a package querystring into an array of urls'
    );

    test.async('test clique.js', function (complete) {

        var clique  = new WebApp(),
            request = new mockRequest('GET', '/clique.js');

        fs.readFile(__dirname + '/../lib/clique.js', 'utf8').then(function (data) {

            var expectedContents = 'define(function(require, exports, module){'
                                 + data.toString('utf8')
                                 + '})';

            clique.handle(request).then(function (response) {
                test.is(response.status, 200, 'Page is found');
                test.is(
                    response.body,
                    expectedContents,
                    'clique.js responds with the contents of the clique module'
                );
                complete.resolve();
            });            
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
