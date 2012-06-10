var Promise = require('promised-io/promise').Promise,
    After   = require('promised-io/promise').all,
    url     = require('url');

function Module (url) {
    if (! url) {
        throw new Error('missing constructor parameter - a module must have a uri');
    }
    this._url        = url;
    this._httpClient = null;
    this._body       = null;
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
    var done = new Promise(),
        self = this;

    this.getHttpClient().get(this._url, function (error, response, body) {
        if (error) {
            done.reject(error);
            return;
        }

        if (response.statusCode != 200) {
            done.reject('Expected 200 http status code, got ' + response.statusCode);
            return;
        }

        self._body = body;
        done.resolve(body);
    })
    return done;
};

Module.prototype.getDependencies = function () {
    if (! this._body) {
        return [];
    }

    var body    = this._body,
        matches = body.match(/(?:[\s\n*\/]+)?define\((?:[\s]*)\[([\w\s\"\,\.\/]+)\]/m);

    if (! matches) {
        return [];
    }

    return matches[1].split(",").map(function (moduleId) {
        return moduleId.replace(/\'|\"|\s/g, '');
    });
}

Module.prototype.urlForPath = function(path) {
    return url.resolve(this._url, path) + '.js';
};

function Package (urls) {
    this._urls = urls;
    this._modules = null;
    this._httpClient = null;
}

Package.prototype.getModules = function() {
    if (! this._modules) {
        this._modules = {};
        for (var i = 0; i < this._urls.length; i++) {
            var url = this._urls[i];
            var m = this._modules[url] = new Module(url);
            if (this._httpClient) {
                m.setHttpClient(this._httpClient);
            }
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

Package.prototype.setHttpClient = function (httpClient) {
    this._httpClient = httpClient;
}

module.exports.Module = Module;
module.exports.Package = Package;