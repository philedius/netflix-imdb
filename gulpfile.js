'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var babel        = require('gulp-babel');

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });


    gulp.watch('scss/*.scss', function() {
        gulp.src('scss/*.scss')
          .pipe(sass().on('error', sass.logError))
          .pipe(gulp.dest('css/'))
          .pipe(sourcemaps.init())
          .pipe(postcss([ autoprefixer() ]))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('css/'));
          console.log('Compiling scss and running autoprefixer...');
    });

    gulp.watch('css/*.css', function() {
      // grab css files and send them into browserSync.stream
      // this injects the css into the page
      gulp.src('css/*.css')
        .pipe(browserSync.stream());
        console.log('Injecting css...');
    });

    gulp.watch(['main.js', 'index.html']).on('change', function() {
        console.log('babel: compiling...');
        gulp.src('main.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest('js/'))
            .pipe(browserSync.stream());
    });

});

gulp.task('autoprefixer', function () {
    return gulp.src('./css/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('css/'));
});

gulp.task('babel', () => {
    console.log('babel: compiling...');
    return gulp.src('main.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('js/'));
});

gulp.task('default', ['babel', 'autoprefixer', 'serve']);
