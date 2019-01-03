const gulp = require('gulp');
const serve = require('gulp-serve');

gulp.task('default', serve('game'));
// gulp.task('serve-build', serve(['public', 'build']));
// gulp.task('serve-prod', serve({
//   root: ['public', 'build'],
//   port: 80  
// }));
