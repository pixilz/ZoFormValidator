const gulp = require('gulp'),
  sass = require('gulp-sass'),
  merge = require('merge-stream');

let sassInput = 'src/scss/**/*.scss',
  cssOutput = './public/css/build/',
  buildOutput = './public/scripts/build/',
  publicNodeModules = [
    'jquery/dist/jquery.min.js'
  ];

gulp.task('styles', () =>
  gulp.src(sassInput)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssOutput))
);

gulp.task('build', () =>
  merge(publicNodeModules.map(modulePath =>
    gulp.src(`./node_modules/${modulePath}`)
      .pipe(gulp.dest(buildOutput))
  ))
);

gulp.task('all', () => merge(gulp.task('build')(), gulp.task('styles')()));
gulp.task('watch', () => gulp.parallel(sassInput, gulp.series('styles')));
