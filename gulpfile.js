var gulp = require('gulp');
var babel = require('gulp-babel');
//var runSeq = require('run-sequence');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
//var livereload = require('gulp-livereload');
var minifyCSS = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var karma = require('karma').server;
var istanbul = require('gulp-istanbul');
var notify = require('gulp-notify');



// gulp.task('reload', function () {
//     livereload.reload();
// });

// gulp.task('reloadCSS', function () {
//     return gulp.src('./public/style.css').pipe(livereload());
// });

gulp.task( 'lintBrowserJS', function() {

  // parses website code for errors
  return gulp.src(['./browser/js/**/*.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

gulp.task( 'lintGameJS', function() {

  // parses game code for errors
  return gulp.src(['./game/js/**/*.js','./game/js/main.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

gulp.task( 'lintServerJS', function() {

  // parses serverside code for errors
  return gulp.src(['./server/js/**/*.js'])
    .pipe( plumber({
      errorHandler: notify.onError( "LINTING FAILED! Check your gulp process." )
    }))
    .pipe( eslint() )
    .pipe( eslint.format() )
    .pipe( eslint.failOnError() );

});

// check all javascript for errors
gulp.task('lintJS', ['lintBrowserJS', 'lintGameJS', 'lintServerJS']);

gulp.task('buildBrowserJS', ['lintBrowserJS'], function () {

  // compiles website javascript into a singular file
  return gulp.src(['./browser/js/app.js', './browser/js/**/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public'));

});

gulp.task('buildGameJS', [], function () {

  // compiles game javascript into a singular file
  return gulp.src(['./game/js/**/*.js', './game/js/main.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('girder-gus.js'))
    //.pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public'));

});

gulp.task('buildJS', ['lintBrowserJS','lintGameJS','buildBrowserJS','buildGameJS']);

gulp.task('copyAssets', function () {

  return gulp.src('./game/assets/**')
    .pipe(plumber())
    .pipe(gulp.dest('./public/assets'));

});

gulp.task('buildCSS', function () {

    var sassCompilation = sass();
    sassCompilation.on('error', console.error.bind(console));

    return gulp.src('./browser/sass/main.sass')
        .pipe(plumber({
            errorHandler: notify.onError('SASS processing failed! Check your gulp process.')
        }))
        .pipe(sassCompilation)
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./public'));
});

gulp.task('build', ['buildJS','buildCSS','copyAssets']);