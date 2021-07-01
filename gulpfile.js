var gulp = require('gulp');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task('clean', function () {
    var dist = gulp.src('dist', {read: false})
        .pipe(clean());
    var build = gulp.src('build', {read: false})
        .pipe(clean());

    return merge(dist, build);
});

gulp.task('build', function () {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("build"));
});

gulp.task('zip', gulp.series('build', function() {
    return merge(gulp.src('build/*'),
        gulp.src('resource/**').pipe(rename(function(file) {
            file.dirname = 'resource/' + file.dirname;
        })),
        gulp.src('node_modules/**').pipe(rename(function(file) {
            file.dirname = 'node_modules/' + file.dirname;
        })),
        gulp.src('models/**').pipe(rename(function(file) {
            file.dirname = 'models/' + file.dirname;
        }))
        ).pipe(zip('handler.zip'))
        .pipe(gulp.dest('dist'));
}));

gulp.task('default', gulp.series('zip'));
