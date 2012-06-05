var litmus = require('litmus');

exports.test = new litmus.Test('Main clique api', function () {
    var test = this;
    test.plan(1);

    var clique = require('../lib/clique');

    test.is(
        clique.create([
            'http://www.example.com/one.js',
            'http://www.example.com/two.js'
        ]),
        'http://clique.rhodgson.co.uk/package?http%3A%2F%2Fwww.example.com%2Fone.js:http%3A%2F%2Fwww.example.com%2Ftwo.js',
        'Can generate a package url given an array of modules'
    );

});