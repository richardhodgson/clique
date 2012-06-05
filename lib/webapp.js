var WebApp = exports.WebApp = require('./micro-shim').webapp(),
    get    = WebApp.get;

var spectrum = require('spectrum');
    
WebApp.prototype.init = function () {
    this.view = new spectrum.Renderer(__dirname + '/../views');
};

get('/', function (request, response, args) {
    response.ok('text/html');
    return this.view.render('/index.spv', {});
});
