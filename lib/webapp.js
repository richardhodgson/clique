var WebApp = exports.WebApp = require('./micro-shim').webapp(),
    get    = WebApp.get;

var spectrum = require('spectrum'),
    Package  = require('./model').Package,
    Promise  = require('promised-io/promise').Promise;

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
        response.ok('text/html');
        complete.resolve(body);
    });
    return complete;
});

WebApp.prototype.init = function () {
    this.view = new spectrum.Renderer(__dirname + '/../views');
};

WebApp.prototype.setPackageClass = function (PackageClass) {
    Package = PackageClass;
}

WebApp.prototype.getUrlsFromQuerystring = function (queryString) {
    return queryString.split(':').map(function (url) {
        return decodeURIComponent(url);
    });
}
