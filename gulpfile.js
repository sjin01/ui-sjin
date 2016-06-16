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

/*var paths = {
    sass: ['src/scss/!**!/!*.scss'],
    js: ['src/js/!**!/!*.js'],
    view: ['src/views/!**!/!*.jade', '!src/views/!**!/!*-layout.jade'],
    json: ['src/views/!**!/!*.json'],
    template: ['src/template/!**!/!*.rac'],
    image: ['src/images/!**!/!*.{jpg,jpeg,png,gif}'],
    font: ['src/fonts/!**!/!*.{eot,svg,ttf,woff,woff2}']
};*/
var srcPaths = {
        sass: ['src/scss/**/*.scss'],
        js:   ['src/js/**/*.js'],
        view: ['src/views/**/*.jade', '!src/views/**/*-layout.jade'],
        json: ['src/views/**/*.json'],
        image:['src/images/**/*.{jpg,jpeg,png,gif}'],
        font: ['src/fonts/**/*.{eot,svg,ttf,woff,woff2}'],
        template: ['src/templates/**/*.rac']
    },
    distPaths = {
        css: 'dist/css/',
        js: 'dist/js/',
        view: 'dist/html/',
        image: 'dist/images/',
        font: 'dist/fonts/',
        template: 'dist/templates/'
    };

/*var commonData = require('./src/base.json');
var jsonRoot = './src/views/';
var backstage = require(jsonRoot + 'backstage.json'),
    operation = require(jsonRoot + 'operation.json'),
    distributor = require(jsonRoot + 'dist.json'),
    supply = require(jsonRoot + 'supply.json');*/
// --- Basic Tasks ---
gulp.task('compass', ['images'], function() {
    return gulp.src(srcPaths.sass)
        .pipe(
            compass({
                config_file: './config.rb',
                css: 'dist/css',
                sass: 'src/scss'
            }).on('error', function(e) {
                gutil.log(e);
                this.emit('end');
            }))
        .pipe(gulp.dest(distPaths.css))
        .pipe(browserSync.stream({
            once: true
        }));
});

gulp.task('js', function() {
    return gulp.src(srcPaths.js)
        .pipe(gulp.dest(distPaths.js))
        .pipe(amdOptimize('base', {
            baseUrl: 'src/js',
            configFile: "src/js/base.js"
        }).on('error', function(e) {
            gutil.log(e);
            this.emit('end');
        }))
        .pipe(concat('base.js'))
        //.pipe( uglify() )
        .pipe(gulp.dest(distPaths.js))
        .pipe(browserSync.stream());
});

gulp.task('views', function() {
    return gulp.src(srcPaths.view, {
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
            pretty: '\t'  // 使生成出来的文件 缩进一个制表符
        }).on('error', function(e) {
            gutil.log(e);
            this.emit('end');
        }))
        .pipe(gulp.dest(distPaths.view))
        .pipe(browserSync.stream({
            once: true
        }));
});

gulp.task('fonts', function() {
    return gulp.src(srcPaths.font)
        .pipe(gulp.dest(distPaths.font))
        .pipe(browserSync.stream());
});

gulp.task('images', function() {
    return gulp.src(srcPaths.image)
        .pipe(gulp.dest(distPaths.image))
        .pipe(browserSync.stream());
});

gulp.task('templates', function() {
    return gulp.src(srcPaths.template)
        .pipe(gulp.dest(distPaths.template))
        .pipe(browserSync.stream());
});

gulp.task('serve', ['js', 'compass', 'views', 'fonts', 'images', 'templates'], function() {
    browserSync.init({
        server: "./dist",
        directory: true
    });
    gulp.watch(srcPaths.sass, ['compass']);
    gulp.watch(srcPaths.js, ['js']);
    gulp.watch(srcPaths.view, ['views']);
    gulp.watch(srcPaths.image, ['images']);
    gulp.watch(srcPaths.font, ['fonts']);
    gulp.watch(srcPaths.template, ['templates']);
    gutil.log('Start up successful!');
});

// Default Task
gulp.task('default', ['serve']);