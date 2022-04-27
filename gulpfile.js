// module consts
const { src, dest, watch, series, parallel } = require("gulp");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");

// file path variables
const files = {
  scssPath: "./app/scss/**/*.scss",
  jsPath: "./app/js/**/*.js",
};

// sass task
const scssTask = () => {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist"));
};

// js task
const jsTask = () => {
  return src(files.jsPath)
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(dest("dist"));
};

// cache busting
const cacheBustTask = () => {
  const cbString = new Date().getTime();

  return src(["index.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("."));
};

// watch task
const watchTask = () => {
  watch([files.scssPath, files.jsPath], parallel(scssTask, jsTask));
};

// default task
exports.default = series(parallel(scssTask, jsTask), cacheBustTask, watchTask);
