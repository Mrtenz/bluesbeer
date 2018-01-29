const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const spawn = require('child_process').spawn;
const fs = require('fs');

gulp.task('start', ['ts'], () => {
    fs.stat('./config.js', error => {
        if (error) {
            throw new Error('Unable to access config.js');
        }
        spawn('node', ['dist/index.js'], {stdio: 'inherit'});
    });
});

gulp.task('ts', ['clean'], () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {
    return del('dist/**');
});
