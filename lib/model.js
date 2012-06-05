var Promise = require('promised-io/promise').Promise,
    After   = require('promised-io/promise').all;

function Module (url) {
    if (! url) {
        throw new Error('missing constructor parameter - a module must have a uri');
    }
    this._url = url;
    this._httpClient = null;
}

Module.prototype.setHttpClient = function(httpClient) {
    this._httpClient = httpClient;
};

Module.prototype.getHttpClient = function() {
    if (! this._httpClient) {
        this._httpClient = require('request');
    }
    return this._httpClient;
};

Module.prototype.get = function() {
    var done = new Promise();
    this.getHttpClient().get(this._url, function (error, response, body) {
        if (error) {
            done.reject(error);
            return;
        }

        if (response.statusCode != 200) {
            done.reject('Expected 200 http status code, got ' + response.statusCode);
            return;
        }

        done.resolve(body);
    })
    return done;
};

function Package (urls) {
    this._urls = urls;
    this._modules = null;
}

Package.prototype.getModules = function() {
    if (! this._modules) {
        this._modules = {};
        for (var i = 0; i < this._urls.length; i++) {
            var url = this._urls[i];
            this._modules[url] = new Module(url);
        }    
    }
    return this._modules;
};

Package.prototype.get = function() {
    var done     = new Promise(),
        modules  = this.getModules(),
        requests = [];

    for (module in modules) {
        requests.push(modules[module].get());
    }

    After(requests).then(function (moduleContents) {
        done.resolve(moduleContents.join(' '));
    });

    return done;
}

module.exports.Module = Module;
module.exports.Package = Package;