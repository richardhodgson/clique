var litmus = require('litmus');

exports.test = new litmus.Test('Internal clique objects', function () {
    var test = this;
    test.plan(12);

    var Module = require('../lib/model').Module;

    var testModule = new Module('http://example.com/something.js');

    test.isa(testModule, Module, 'Can create an instance of a Module');

    test.throwsOk(
        function () {
            new Module();
        },
        /missing/i,
        'Cannot create a module without a url'
    );

    var mock_request_callback,
        mock_request = {};
    mock_request.get = function (url, callback) {
        test.is(url, 'http://example.com/something.js', 'module calls request module with url');
        mock_request_callback = callback;
    }

    testModule.setHttpClient(mock_request);

    var result = testModule.get();
    test.isa(result['then'], Function, 'get returns a promise');

    this.async('test successful response', function (complete) {

        testModule.get().then(function (contents) {

            test.is(contents, 'some contents', 'resource body is returned by calling get()');

            complete.resolve();
        });

        mock_request_callback(null, {statusCode: 200}, 'some contents');
    });

    test.async('test error response', function (complete) {

        testModule.get().then(
            function () {
                complete.reject('get() resolved unexpectedly');
            },
            function (error) {
                test.is(error, 'an error', 'error is passed to get()');
                complete.resolve();
            }
        );

        mock_request_callback('an error', null, null);
    });

    test.async('package creates and gets modules', function (complete) {

        var Package = require('../lib/model').Package;

        var testPackage = new Package([
            'http://example.com/one.js',
            'http://example.com/two.js'
        ]);

        test.isa(testPackage, Package, 'can create an instance of Package');


        var counter = 0,
            mock_request = {};
        mock_request.get = function (url, callback) {
            counter++;
            callback(null, {statusCode: 200}, 'response' + counter);
        };

        testPackage.setHttpClient(mock_request);

        var modules = testPackage.getModules();

        test.is(
            modules,
            createMockModules(Module, mock_request),
            'Package creates module instances for each url is was constructed with'
        );

        test.is(
            modules['http://example.com/one.js'].getHttpClient().get,
            mock_request.get,
            'Package proxies http client to child Modules'
        );

        testPackage.get().then(function (contents) {
            test.is(contents, 'response1 response2', 'Package is created from module responses');
            complete.resolve();
        });
    });
});

function createMockModules (Module, httpClient) {

    var modules = {
        'http://example.com/one.js': new Module('http://example.com/one.js'),
        'http://example.com/two.js': new Module('http://example.com/two.js')
    }

    for (var module in modules) {
        modules[module].setHttpClient(httpClient);
    }

    return modules;
}
