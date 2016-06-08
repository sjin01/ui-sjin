var gulp = require('gulp'),
    gutil = require('gulp-util'),
    compass = require('gulp-compass'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    data = require('gulp-data'),
    concat = require('gulp-concat'),
    path = require('path'),
    fs = require('fs'),
    extend = require('extend'),
    amdOptimize = require("amd-optimize"),
    browserSync = require('browser-sync').create();

var paths = {
    sass: ['src/scss/**/*.scss'],
    js: ['src/js/**/*.js'],
    view: ['src/views/**/*.jade', '!src/views/**/*-layout.jade'],
    json: ['src/views/**/*.json'],
    template: ['src/template/**/*.rac'],
    image: ['src/images/**/*.{jpg,jpeg,png,gif}'],
    font: ['src/fonts/**/*.{eot,svg,ttf,woff,woff2}']
};

/*var commonData = require('./src/base.json');
var jsonRoot = './src/views/';
var backstage = require(jsonRoot + 'backstage.json'),
    operation = require(jsonRoot + 'operation.json'),
    distributor = require(jsonRoot + 'dist.json'),
    supply = require(jsonRoot + 'supply.json');*/
// --- Basic Tasks ---
gulp.task('compass', ['images'], function() {
    return gulp.src(paths.sass)
        .pipe(
            compass({
                config_file: './config.rb',
                css: 'dist/css',
                sass: 'src/scss'
            }).on('error', function(e) {
                gutil.log(e);
                this.emit('end');
            }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream({
            once: true
        }));
});

gulp.task('js', function() {
    return gulp.src(paths.js)
        .pipe(gulp.dest('dist/js/'))
        .pipe(amdOptimize('base', {
            baseUrl: 'src/js',
            configFile: "src/js/base.js"
        }).on('error', function(e) {
            gutil.log(e);
            this.emit('end');
        }))
        .pipe(concat('base.js'))
        //.pipe( uglify() )
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.stream());
});

gulp.task('views', function() {
    return gulp.src(paths.view, {
            base: "src/views"
        })
        .pipe(data(function(file) {
            var relativePath = file.path.replace(path.resolve(file.base), '');
            var depth = (relativePath.match(new RegExp("\\" + path.sep, "g")) || []).length;
            var relativeRoot = new Array(depth).join('../../');
            var dataPath = file.path.replace('.jade', ".json");
            var data = {};
            var isMemberCenter = relativePath.indexOf("memberCenter") == 0;
            var result = {
                relativeRoot: relativeRoot
            };
            if (fs.existsSync(dataPath)) {
                data = require(dataPath);
            }
            // 合并数据并返回
            extend(result, data/*, commonData, {isMemberCenter: isMemberCenter}*/);
            return result;
        }))
        .pipe(jade({
            pretty: true
        }).on('error', function(e) {
            gutil.log(e);
            this.emit('end');
        }))
        .pipe(gulp.dest('dist/html/'))
        .pipe(browserSync.stream({
            once: true
        }));
});

gulp.task('fonts', function() {
    return gulp.src(paths.font)
        .pipe(gulp.dest('dist/fonts/'))
        .pipe(browserSync.stream());
});

gulp.task('images', function() {
    return gulp.src(paths.image)
        .pipe(gulp.dest('dist/images/'))
        .pipe(browserSync.stream());
});

gulp.task('templates', function() {
    return gulp.src(paths.template)
        .pipe(gulp.dest('dist/template/'))
        .pipe(browserSync.stream());
});

gulp.task('serve', ['js', 'compass', 'views', 'fonts', 'images', 'templates'], function() {
    browserSync.init({
        server: "./dist",
        directory: true
    });

    gulp.watch(paths.sass, ['compass']);

    gulp.watch(paths.js, ['js']);

    gulp.watch(paths.view, ['views']);

    gulp.watch(paths.image, ['images']);

    gulp.watch(paths.font, ['fonts']);

    gulp.watch(paths.template, ['templates']);

    gutil.log('Start up successful!');
});


// Default Task
gulp.task('default', ['serve']);