var BASE_URL = 'http://clique.rhodgson.co.uk',
    SEPARATOR = ':';

function create (urls) {

    // would use Array.map but going for browser compatibility
    for (var i = 0; i < urls.length; i++) {
        urls[i] = encodeURIComponent(urls[i]);
    }

    return BASE_URL + '/package?' + urls.join(SEPARATOR);
}

module.exports.create = create;
module.exports.SEPARATOR = SEPARATOR;
