var Promise = require('promised-io/promise').Promise,
    After   = require('promised-io/promise').all,
    url     = require('url');

function Module (url) {
    if (! url) {
        throw new Error('missing constructor parameter - a module must have a uri');
    }
    this._url          = url;
    this._httpClient   = null;
    this._body         = null;
    this._dependencies = [];
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
        done.resolve(self);
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

    var moduleIds = matches[1].split(",").map(function (moduleId) {
        return moduleId.replace(/\'|\"|\s/g, '');
    });

    var dependencies = [],
        dependency;

    for (var i = 0, l = moduleIds.length; i < l; i++) {
        dependency = new Module(this.urlForPath(moduleIds[i]));
        dependency.setHttpClient(this.getHttpClient());
        dependencies.push(dependency);
    };

    this._dependencies = dependencies;

    return dependencies;
}

Module.prototype.urlForPath = function(path) {
    return url.resolve(this._url, path) + '.js';
};

Module.prototype.toString = function() {

    var body  = this._body,
        isAmd = body.match(/(?:[\s\n*\/]+)?define\(/m);

    if (isAmd) {

        var moduleId = this._url;
        if (moduleId.substr(-3) == '.js') {
            moduleId = moduleId.substr(0, moduleId.length - 3);
        }

        body = body.replace('define(', 'define("' + moduleId + '",');
    }

    if (this._dependencies.length > 0) {
        body = this._dependencies.join(' ') + ' ' + body;
    }

    return body;
};

function Package (urls) {
    this._urls = urls;
    this._modules = null;
    this._httpClient = null;
}

Package.prototype.getModules = function() {
    if (! this._modules) {
        this._modules = [];
        for (var i = 0, l = this._urls.length; i < l; i++) {
            var url = this._urls[i],
                module = new Module(url);

            if (this._httpClient) {
                module.setHttpClient(this._httpClient);
            }

            this._modules.push(module)
        }    
    }
    return this._modules;
};

Package.prototype.get = function() {

    var requestModules = function (modules) {
        var done     = new Promise(),
            requests = [];

        for (module in modules) {
            requests.push(modules[module].get());
        }

        After(requests).then(function (modules) {

            var requests = [];

            for (module in modules) {
                var dependencies = modules[module].getDependencies();
                if (dependencies.length > 0) {
                    requests.push(requestModules(dependencies));
                }
            }

            After(requests).then(function () {
                done.resolve(modules.join(' '));
            });

        });

        return done;
    }
    return requestModules(this.getModules());
}

Package.prototype.setHttpClient = function (httpClient) {
    this._httpClient = httpClient;
}

module.exports.Module  = Module;
module.exports.Package = Package;