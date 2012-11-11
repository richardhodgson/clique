var WebApp = exports.WebApp = require('micro').webapp(),
    get    = WebApp.get;

var spectrum = require('spectrum'),
    Package  = require('./model').Package,
    Promise  = require('promised-io/promise').Promise,
    fs       = require('promised-io/fs');

var SEPARATOR = require('./clique').SEPARATOR;

get('/', function (request, response) {
    response.ok('text/html');
    return this.view.render('/index.spv', {});
});

get('/favicon.ico', function (request, response) {
    response.notFound();
});

get('/package', function (request, response) {

    var complete = new Promise();
    urls = this.getUrlsFromQuerystring(request.queryString);

    var package = new Package(urls);

    package.get().then(function (body) {
        response.ok('application/javascript');
        complete.resolve(body);
    });
    return complete;
});

var cliqueJsResponse = null;
get('/clique.js', function (request, response) {
    var complete = new Promise();

    response.ok('application/javascript');

    if (cliqueJsResponse) {
        complete.resolve(cliqueJsResponse);
    }
    else {
        fs.readFile(__dirname + '/clique.js', 'utf8').then(function (data) {

            cliqueJsResponse = 'define(function(require, exports, module){'
                             + data.toString('utf8')
                             + '})';

            complete.resolve(
                cliqueJsResponse
            );
        });
    }

    return complete;
});

WebApp.prototype.init = function () {
    this.view = new spectrum.Renderer(__dirname + '/../views');
};

WebApp.prototype.setPackageClass = function (PackageClass) {
    Package = PackageClass;
}

WebApp.prototype.getUrlsFromQuerystring = function (queryString) {
    return queryString.split(SEPARATOR).map(function (url) {
        return decodeURIComponent(url);
    });
}
