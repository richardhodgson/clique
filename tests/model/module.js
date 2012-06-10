var litmus = require('litmus');

exports.test = new litmus.Test('Model Module', function () {
    var test = this;
    test.plan(16);

    var Module = require('../../lib/model').Module;

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

    this.async('test get dependencies', function (complete) {

        testModule.get().then(function () {

            test.is(
                testModule.getDependencies(),
                [
                    "./a",
                    "./b"
                ],
                'Dependencies are found in module definition'
            )

            complete.resolve();
        });

        mock_request_callback(null, {statusCode: 200}, ' /* a comment */ define(["./a", "./b"], function () { console.log("test"); })');
    });

    this.async('test get no dependencies', function (complete) {

        testModule.get().then(function () {

            test.is(
                testModule.getDependencies(),
                [],
                'No dependencies are found in module definition'
            )

            complete.resolve();
        });

        mock_request_callback(null, {statusCode: 200}, ' /* a comment */ define(function () { ["./a", "./b"]; })');
    });

    var anotherModule = new Module('http://example.com/path/to/something.js');

    test.is(
        anotherModule.urlForPath('./other'),
        'http://example.com/path/to/other.js',
        'Determine the absolute url for a sibling file'
    );

    test.is(
        anotherModule.urlForPath('../../other'),
        'http://example.com/other.js',
        'Determine the absolute url for a base file'
    );

    test.is(
        anotherModule.urlForPath('./something/other'),
        'http://example.com/path/to/something/other.js',
        'Determine the absolute url for a child file'
    );

    test.is(
        anotherModule.urlForPath('another'),
        'http://example.com/path/to/another.js',
        'Determine the absolute url non relative module id'
    );
});
