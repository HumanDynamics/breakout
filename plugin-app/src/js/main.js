// require(["lib.js"], function(lib) {
// });

requirejs.config({
    baseUrl: 'https://breakout.media.mit.edu/plugin/src/js',
    paths: {
        scripts: '.'
    }
});

requirejs(["scripts/lib"]);
