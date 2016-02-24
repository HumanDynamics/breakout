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

    packages: [
            {
                name: 'cs',
                location: './bower_components/require-cs',
                main: 'cs'
            },
            {
                name: 'coffee-script',
                location: './bower_components/coffeescript',
                main: 'extras/coffee-script'
            }
    ],

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
        gapi: 'https://plus.google.com/hangouts/_/api/v1/hangout',
        // include materialize...
        'materialize.global': './bower_components/Materialize/js/global',
        'materialize.animation': './bower_components/Materialize/js/animation',
        'materialize.toasts': './bower_components/Materialize/js/toasts',
        'materialize.collapsible': './bower_components/Materialize/js/collapsible',
        'materialize.dropdown': './bower_components/Materialize/js/dropdown',
        'materialize.leanModal': './bower_components/Materialize/js/leanModal',
        'materialize.materialbox': './bower_components/Materialize/js/materialbox',
        'materialize.parallax': './bower_components/Materialize/js/parallax',
        'materialize.tabs': './bower_components/Materialize/js/tabs',
        'materialize.tooltip': './bower_components/Materialize/js/tooltip',
        'materialize.sideNav': './bower_components/Materialize/js/sideNav',
        'materialize.scrollspy': './bower_components/Materialize/js/scrollspy',
        'materialize.forms': './bower_components/Materialize/js/forms',
        'materialize.slider': './bower_components/Materialize/js/slider',
        'materialize.cards': './bower_components/Materialize/js/cards',
        'materialize.pushpin': './bower_components/Materialize/js/pushpin',
        'materialize.transitions': './bower_components/Materialize/js/transitions',
        'materialize.scrollFire': './bower_components/Materialize/js/scrollFire',
        'materialize.waves': './bower_components/Materialize/js/waves',
        'materialize.character_counter': './bower_components/Materialize/js/character_counter',
        'materialize.picker': './bower_components/Materialize/js/date_picker/picker',
        'materialize.picker.date': './bower_components/Materialize/js/date_picker/picker.date',
        'hammerjs': './bower_components/hammerjs/hammer',
        'jquery-hammerjs': './bower_components/jquery-hammerjs/jquery.hammer',
        'velocity': './bower_components/velocity/velocity'
    },

    shim: {
        'jquery': {
            exports: '$'
        },
        'materialize.global': {
            deps: [
                'jquery',
                'hammerjs',
                'jquery-hammerjs',
                'velocity'
            ]
        },
        'materialize.animation': {
            deps: ['materialize.global']
        },
        'materialize.toasts': {
            deps: ['materialize.global']
        },
        'materialize.collapsible': {
            deps: ['materialize.global']
        },
        'materialize.dropdown': {
            deps: ['materialize.global']
        },
        'materialize.leanModal': {
            deps: ['materialize.global']
        },
        'materialize.materialbox': {
            deps: ['materialize.global']
        },
        'materialize.parallax': {
            deps: ['materialize.global']
        },
        'materialize.tabs': {
            deps: ['materialize.global']
        },
        'materialize.tooltip': {
            deps: ['materialize.global']
        },
        'materialize.sideNav': {
            deps: ['materialize.global']
        },
        'materialize.scrollspy': {
            deps: ['materialize.global']
        },
        'materialize.forms': {
            deps: ['materialize.global']
        },
        'materialize.slider': {
            deps: ['materialize.global']
        },
        'materialize.cards': {
            deps: ['materialize.global']
        },
        'materialize.pushpin': {
            deps: ['materialize.global']
        },
        'materialize.transitions': {
            deps: [
                'materialize.global',
                'materialize.scrollFire'
            ]
        },
        'materialize.scrollFire': {
            deps: ['materialize.global']
        },
        'materialize.waves': {
            deps: ['materialize.global']
        },
        'materialize.character_counter': {
            deps: ['materialize.global']
        },
        'materialize.picker': {
            deps: ['materialize.global']
        },
        'materialize.picker.date': {
            deps: ['materialize.picker']
        },
        'hammerjs': {
            deps: ['jquery']
        },
        'velocity': {
            deps: ['jquery']
        }
    }
});


// Main function / js injection point
// requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
requirejs([
    'jquery',
    'materialize.global',
    'materialize.animation',
    'materialize.toasts',
    'materialize.collapsible',
    'materialize.dropdown',
    'materialize.leanModal',
    'materialize.materialbox',
    'materialize.parallax',
    'materialize.tabs',
    'materialize.tooltip',
    'materialize.sideNav',
    'materialize.scrollspy',
    'materialize.forms',
    'materialize.slider',
    'materialize.cards',
    'materialize.pushpin',
    'materialize.transitions',
    'materialize.scrollFire',
    'materialize.waves',
    'materialize.character_counter',
    'materialize.picker',
    'materialize.picker.date',
    'gapi',
    'src/lib']);
