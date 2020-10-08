const gulp = require('gulp');
const exec = require('child_process').exec;

gulp.task('build:front', function (cb) {
  exec('cd we-file && npm run build', function (err) {
    if (err) {
      console.log(err);
    }
    gulp.src('we-file/dist/**/*')
      .pipe(gulp.dest('dist/we-file/'));
    cb();
  });
});

gulp.task('build:admin', function (cb) {
  exec('cd we-file-admin && npm run build:prod', function (err) {
    if (err) {
      console.log(err);
    }
    gulp.src('we-file-admin/dist/**/*')
      .pipe(gulp.dest('dist/we-file-admin/'));
    cb();
  });
});

gulp.task('build:all', gulp.parallel('build:front', 'build:admin', function(cb) {
  cb();
}));
