var BASE_URL = 'http://clique.rhodgson.co.uk',
    SEPARATOR = ':';

function create (urls) {

    if (!urls || !urls.length || urls.length == 0) {
        throw new Error('create() expects an array of urls');
    }

    // would use Array.map but going for browser compatibility
    for (var i = 0; i < urls.length; i++) {
        urls[i] = encodeURIComponent(urls[i]);
    }

    return BASE_URL + '/package?' + urls.join(SEPARATOR);
}

exports.create = create;
exports.SEPARATOR = SEPARATOR;
