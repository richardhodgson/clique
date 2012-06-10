var litmus = require('litmus');

exports.test = new litmus.Test('Model Package', function () {
    var test = this;
    test.plan(4);

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

