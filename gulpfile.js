var babel       = require('gulp-babel');
var concat      = require('gulp-concat');
var eslint      = require('gulp-eslint');
var gulp        = require('gulp');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var sourcemaps  = require('gulp-sourcemaps');


gulp.task( 'lintBrowserJS', function() {

  return gulp.src(['./browser/js/**/*.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

gulp.task( 'lintGameJS', function() {

  return gulp.src(['./game/js/**/*.js','./game/js/main.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

gulp.task( 'lintServerJS', function() {

  return gulp.src(['./server/js/**/*.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

gulp.task('lintJS', ['lintBrowserJS', 'lintGameJS', 'lintServerJS']);

gulp.task('buildBrowserJS', ['lintBrowserJS'], function () {

    return gulp.src(['./browser/js/app.js', './browser/js/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public'));

});

gulp.task('buildGameJS', ['lintGameJS'], function () {

    return gulp.src(['./game/js/**/*.js', './game/js/main.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('girder-gus.js'))
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public'));

});
