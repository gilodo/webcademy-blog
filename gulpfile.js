const gulp = require('gulp');                                           // Подключаем Gulp
const browserSync = require('browser-sync').create();                   // Подключаем BrowserSync
const watch = require('gulp-watch');                                    // Подключаем пакет слежения за файлами
const sass = require('gulp-sass')(require('sass'));                     // Подключаем SASS-компилятор
const autoprefixer = require('gulp-autoprefixer');                      // Подключаем пакет, который будет устанавливать браузерные префиксы
const sourcemaps = require('gulp-sourcemaps');                          // Подключаем пакет, который будет компилировать исходные карты (source maps)
const notify = require('gulp-notify');                                  // Подключаем пакет, который будет уведомлять об ошибках
const plumber = require('gulp-plumber');                                // Подключаем пакет, который будет отслеживать ошибки (так, чтобы сборка не вылетала)
const gcmq = require('gulp-group-css-media-queries');                   // Подключаем пакет, который будет группировать медиа-запросы
const sassGlob = require('gulp-sass-glob');                             // Подключаем пакет, который будет автоматически подключать scss файлы
const pug = require('gulp-pug');                                        // Подключаем Pug
const del = require('del');                                             // Подключаем пакет, который будет очищать папку

// Задача для сборки Pug файлов
gulp.task('pug', function(callback) {
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.stream())
    callback();    
})

// Задача для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
    return gulp.src('./src/scss/main.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({
            indentType: "tab",
            indentWidth: 1,
            outputStyle: "expanded"
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream())
    callback();
});

// Задача для копирования изображений
gulp.task('copy:img', function(callback) {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img/'))
    callback();
})

// Задача для копирования скриптов
gulp.task('copy:js', function(callback) {
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js/'))
    callback();
})

// Задача для слежения за SCSS и PUG файлами
gulp.task('watch', function() {
    // Обновление браузера при изменении скриптов и картинок
    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload));
    // Слежение за SCSS и компиляция в CSS с задержкой в 1 секунду (приём против бага scss на более медленных жёстких дисках HDD)
    watch('./src/scss/**/*.scss', function() {
        setTimeout(gulp.parallel('scss'), 1000);
    })
    // Слежение за PUG и сборка
    watch('./src/pug/**/*.pug', gulp.parallel('pug'))
    // Слежение за картинками и копирование их в build
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))
    // Слежение за скриптами и копирование их в build
    watch('./src/js/**/*.*', gulp.parallel('copy:js'))
});

// Задача для запуска сервера из папки build
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
});

// Задача для очистки папки build
gulp.task('clean:build', function() {
    return del('./build')
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно (параллельно) сначала задачи scss, pug, copy:imgk, copy:js, затем server и watch, 
gulp.task(
    'default', 
    gulp.series(
        gulp.parallel('clean:build'),
        gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
        gulp.parallel('server', 'watch')
    )
);