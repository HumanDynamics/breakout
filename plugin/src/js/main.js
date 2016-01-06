// Main Require config.
// Special cases:
// Primus: Primus generates its client-side library when the node
// server runs and makes it available as a REST endpoint. We access that here.
// Google Hangouts API: we pull this from google's CDN.
requirejs.config({
    baseUrl: 'https://breakout.media.mit.edu/dev/plugin/src/',
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
        // charts: './charts/js',
        libs: './bower_components',
        jquery: './bower_components/jquery/dist/jquery',
        d3: './bower_components/d3/d3',
        _: './bower_components/underscore/underscore',
        primus: 'https://breakout.media.mit.edu/primus/primus',
        gapi: 'https://plus.google.com/hangouts/_/api/v1/hangout',
        hangoutUtils: './js/hangoutUtils'
    }
});

// Main function / js injection point
// requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
requirejs(["src/lib"]);
