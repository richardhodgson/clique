# Clique

Self service AMD packages.

Its generally considered better to deliver a web page's JS in as few requests as possible. The solution should be simple and not rely on a build or similiar pre-deploy step.

Minimising requests shouldn't affect cacheability. JS urls that include a unique identifier in their url (such as a version number) should still be able to be publically far-future cached and delivered in a single request.

A project's use of a JS loader should unaffected by how the JS is packaged.

    npm install clique

## Node

Use _clique_ to generate the package url.

    var clique = require('clique');

    var url = clique.create([
        'http://code.jquery.com/jquery-1.7.2.min.js',
        'http://example.com/some.js'
    ]);

Now in your template:

    '<script type="text/javascript" src="' + url + '"></script>'

## Browser

In the browser:
    
    require(['http://clique.rhodgson.co.uk/clique.js'], function (clique) {

        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script");

        script.url = clique.create([
            'http://code.jquery.com/jquery-1.7.2.min.js',
            'http://example.com/some.js'
        ]);

        head.appendChild(script);

    });
