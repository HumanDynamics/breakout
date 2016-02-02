var browserify   = require('browserify');
var reactify   = require('reactify');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');


gulp.task('browserify', function(){


    // TODO maybe it's worth trying to integrate watchify
    return browserify({
        entries: ['./src/js/app.jsx'],
        extensions: ['.jsx'],
        paths: ['./node_modules','./src/js/'],
        debug: true
    })
        .transform('babelify', {presets: ["es2015", "react"]})
        .transform('reactify')
        .bundle()
        .on('error', handleErrors)
        .pipe(source('app.js'))
        .pipe(gulp.dest('./www'));

});
