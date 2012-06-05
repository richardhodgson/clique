var Promise = require('promised-io').Promise;

function Module (url) {
    if (! url) {
        throw new Error('missing constructor parameter - a module must have a uri');
    }
    this._url = url;
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

module.exports.Module = Module;