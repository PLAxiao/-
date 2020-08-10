// 实现这个项目的构建任务
var gulp = require("gulp"),
    concat = require("gulp-concat"),
    htmlmin = require("gulp-htmlmin"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    imageMin = require("gulp-imagemin");


let cleanCSS = require('gulp-clean-css');
const { series, parallel } = require("gulp");
const babel = require('gulp-babel');

var server = require('gulp-server-livereload')

var fs = require('fs');
let path = require('path');







function minHtml(cb) {
    gulp.src("src/**/*.html")
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true,
                removeComments: true
            })
        )
        .pipe(gulp.dest(htmlTarget));

    cb();
}






function minifyCss(cb) {
    return gulp
        .src(cssPath)
        .pipe(postcss(processors))
        .pipe(concat("style.css"))
        .pipe(px2rem({ 'width_design': 750, 'valid_num': 6, 'pieces': 10 }))
        .pipe(gulp.dest("./dist/mobile/css"))
        .pipe(
            cleanCSS({
                keepSpecialComments: 0
            })
        )
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest(targetCss))
    cb();
}



function image(cb) {

    return gulp
        .src("mobile/image/*.*")
        .pipe(
            imageMin({
                progressive: true
            })
        )
        .pipe(gulp.dest(targetImage));
    cb();
}



function minifyJS(cb) {
    let uglifyOpt = {
        mangle: {
            keep_fnames: true,
            properties: false,
        },
    };



    gulp.src(['mobile/js/*.js', '!mobile/js/*.min.js'])
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(
            uglify(uglifyOpt)
        )
        .pipe(gulp.dest(targetJs));

    gulp.src(['mobile/js/*.min.js']).pipe(gulp.dest(targetJs));

    cb();
}


function webserver(cb) {
    if (lauchWebserver) {
        gulp.src('./').pipe(
            server({
                livereload: {
                    enable: true,
                    port: 35728
                },
                directoryListing: true,
                open: true,
                host: '0.0.0.0'
            })
        )
        gulp.watch("./src/*.html", series(minHtml));
        gulp.watch("./mobile/css/*.css", series(minifyCss));
        gulp.watch("./mobile/css/*.scss", series(minifyCss));
        gulp.watch("./mobile/image/*.*", series(image));
        gulp.watch("./mobile/js/*.js", series(minifyJS));

        gulp.watch("./pc/*.html", series(minHtml1));
        gulp.watch("./pc/css/*.css", series(minifyCss1));
        gulp.watch("./pc/css/*.scss", series(minifyCss1));
        gulp.watch("./pc/image/*.*", series(image1));
        gulp.watch("./pc/js/*.js", series(minifyJS1));
        lauchWebserver = false
        cb()
    } else {
        cb()
    }
}

function cleanDist() {
    const execSync = require('child_process').execSync;
    var path = './dist/';
    try {
        let result = execSync('rm -r ' + path);
        console.log(`[${new Date().toLocaleTimeString()}]` + '  dist is clean');
    } catch (error) {
        console.log(error);
    }
}
cleanDist();
let tasks = [minifyJS, minifyCss, minHtml, image, minifyJS1, minifyCss1, minHtml1, minHtml1, image1, minHtml2];
if (isDev) {
    tasks.push(webserver);
}
exports.default = series(...tasks);