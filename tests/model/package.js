var litmus = require('litmus');

exports.test = new litmus.Test('Model Package', function () {
    var test = this;
    test.plan(8);

    var Package = require('../../lib/model').Package;

    test.async('package creates and gets modules', function (complete) {

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
            require('./module').createMockModules(
                [
                    'http://example.com/one.js',
                    'http://example.com/two.js'
                ],
                mock_request
            ),
            'Package creates module instances for each url is was constructed with'
        );

        test.is(
            modules[0].getHttpClient().get,
            mock_request.get,
            'Package proxies http client to child Modules'
        );

        testPackage.get().then(function (contents) {
            test.is(contents, 'response1 response2', 'Package is created from module responses');
            complete.resolve();
        });
    });

    test.async('package will resolve module dependencies', function (complete) {
        var testPackage = new Package([
            'http://example.com/one.js'
        ]);

        var counter = 0,
            mock_request = {};

        mock_request.get = function (url, callback) {
            var response = '';
            counter++;

            switch (counter) {
                case 1:
                    test.is(url, 'http://example.com/one.js', 'first module is requested');
                    response = 'define(["./two"], function () {})';
                    break;
                case 2:
                    test.is(url, 'http://example.com/two.js', 'dependency second module is requested');
                    response = 'define(["./path/three"], function () {})';
                    break;
                case 3:
                    test.is(url, 'http://example.com/path/three.js', 'dependency third module is requested');
                    response = 'define(function () {})';
                    break;
            }

            callback(null, {statusCode: 200}, response);
        };

        testPackage.setHttpClient(mock_request);

        testPackage.get().then(function (contents) {
            test.is(
                contents,
                'define(function () {}) define(["./path/three"], function () {}) define(["./two"], function () {})',
                'Package is created from module and its dependency'
            );
            complete.resolve();
        });

    });
});

