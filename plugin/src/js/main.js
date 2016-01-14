// Main Require config.
// Special cases:

// Primus: Primus generates its client-side library when the node
// server runs and makes it available as a REST endpoint. We access that here.

// Google Hangouts API: we pull this from google's CDN. This is a
// non-AMD javascript file, so we refer to gapi through `window.gapi`
// (`gapi` itself is now of type `undefined`, see
// http://stackoverflow.com/questions/14587720/using-requirejs-alongside-non-amd-javascript-files)
requirejs.config({
    baseUrl: 'https://breakout-dev.media.mit.edu/plugin/src/',
    // do this to get cross-origin javascript through CDNs, etc.
    text: {
        useXhr: function (url, protocol, hostname, port) {
            // allow cross-domain requests
            // remote server allows CORS
            return true;
        }
    },
    paths: {
        src: './js',
        libs: './bower_components',
        jquery: './bower_components/jquery/dist/jquery',
        d3: './bower_components/d3/d3',
        underscore: './bower_components/underscore/underscore',
        underscore_string: './bower_components/underscore.string/dist/underscore.string',
        feathers: './bower_components/feathers-client/dist/feathers',
        socketio: './bower_components/socket.io-client/socket.io',
        primus: 'https://breakout-dev.media.mit.edu/primus/primus',
        gapi: 'https://plus.google.com/hangouts/_/api/v1/hangout'
    }
});

// Main function / js injection point
// requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
requirejs(['gapi', 'src/lib']);
