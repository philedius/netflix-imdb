'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

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
          .pipe(browserSync.stream());
          console.log('Compiling scss...');
    });

    gulp.watch('css/*.css', function() {
      // grab css files and send them into browserSync.stream
      // this injects the css into the page
      gulp.src('css/*.css')
        .pipe(browserSync.stream());
        console.log('Injecting css...');
    });

    gulp.watch(['main.js', 'index.html']).on('change', browserSync.reload);
});

// gulp.task('sass', function () {
//   return gulp.src('scss/*.scss')
//     .pipe(sass().on('error', sass.logError))
//     .pipe(gulp.dest('/css'))
//     .pipe(browserSync.stream());
// });

gulp.task('default', ['serve']);
