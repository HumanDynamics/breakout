// require(["lib.js"], function(lib) {
// });

requirejs.config({
    baseUrl: 'https://breakout.media.mit.edu/plugin/src/js',
    paths: {
        scripts: '.',
        charts: './charts/js',
        libs: './bower_components'
    }
});

requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
