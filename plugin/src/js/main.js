requirejs.config({
    baseUrl: 'https://breakout.media.mit.edu/dev/plugin/src/',
    paths: {
        scripts: './js',
        // charts: './charts/js',
        libs: './bower_components',
        jquery: './bower_components/jquery/dist/jquery',
        d3: './bower_components/d3/d3',
        underscore: './bower_components/d3/d3',
        // primus is special, it's generated when the server starts.
        primus: 'https://breakout.media.mit.edu/primus/primus'
        // and add others like this...
    }
});

// requirejs(["scripts/lib", "charts/pieChart", "charts/herfindahl", "charts/all"]);
requirejs(["scripts/lib"], function(lib) {
    console.log("lib primus: ", lib.primus);
});
