_(work in progress, see whats still [todo](https://github.com/richardhodgson/clique/todo.md))_

# Clique

Self service RequireJS packages.

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
