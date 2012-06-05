var litmus = require('litmus');

exports.test = new litmus.Test('Main Clique api', function () {
    var test = this;
    test.plan(8);

    var Module = require('../lib/model').Module;

    var testModule = new Module('http://example.com/something.js');

    test.isa(testModule, Module, 'Can create an instance of a module');

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

    this.async('test successful response', function(handle) {

        testModule.get().then(function (body) {

            test.is(body, 'some contents', 'resource body is returned by calling get()');

            handle.resolve();
        });

        mock_request_callback(null, {statusCode: 200}, 'some contents');
    });

    this.async('test error response', function(handle) {

        testModule.get().then(
            function () {
                handle.reject('get() resolved unexpectedly');
            },
            function (error) {
                test.is(error, 'an error', 'error is passed to get()');
                handle.resolve();
            }
        );

        mock_request_callback('an error', null, null);
    });

});