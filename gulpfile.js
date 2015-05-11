var gulp = require('gulp');
var path = require('path');
var concat = require('gulp-concat')
var replace = require('gulp-replace')
//http://www.cnblogs.com/code/articles/4103070.html
//https://github.com/basecss/jshint-doc-cn/blob/master/options.md
var jshint = require('gulp-jshint')
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

function replaceUrls(array, hash) {
    for (var i = 0, href; href = array[i]; i++) {
        for (var key in hash) {
            if (href.indexOf(key) !== -1) {
                array[i] = href.replace(key, hash[key])
                delete hash[key]
                continue
            }
        }
    }
}

gulp.task('combo', function () {
//https://github.com/isaacs/node-glob
//http://www.linuxjournal.com/content/bash-extended-globbing
    //http://www.cnblogs.com/chyingp/p/gulp-src-implement.html
    var files = [
        "inter",
        "variable",
        "cache",
        "configuration",
        "core",
        "dom.polyfill",
        "dom",
        "scan",
        "scanTag",
        "scanNode",
        "scanAttr",
        "scanText",
        "parser",
        "EventBus",
        "modelFactory",
        "collection",
        "dispatcher"
    ]
    var directives = ["text", "html", "visible", "if", "attr", "data", "duplex", "class"]
    directives = directives.map(function (el) {
        return "directive/" + el
    })
    files = files.concat(directives)
    files.push("outer")
    files = files.map(function (el) {
        return "./string-avalon-src/" + el + ".js"
    })

    var version = 1.43 //当前版本号
    var now = new Date  //构建日期
    var date = now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate()

    gulp.src(files)
            .pipe(concat('avalon.js'))
            .pipe(replace(/version:\s+([\d\.]+)/, function (a, b) {
                return "version: " + version
            }))
            .pipe(replace(/!!!/, function (a, b) {
                return  "avalon.js " + version + " built in " + date + "\n 用于后端渲染"
            }))
            .pipe(gulp.dest('./'))

})
gulp.task('default', ['combo'], function () {
    console.log('合并完毕')
});