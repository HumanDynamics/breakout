// require(["lib.js"], function(lib) {
// });

requirejs.config({
    baseUrl: 'https://breakout.media.mit.edu/plugin/src/js',
    paths: {
        scripts: '.',
        charts: './charts/js'
    }
});

requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
