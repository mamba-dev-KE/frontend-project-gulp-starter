// module imports using commonjs
const { src, dest, watch, series, parallel } = require("gulp");
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const sass = require("gulp-sass")(require("sass"));
const terser = require("gulp-terser");

// file path variables
const files = {
  scssPath: "./app/scss/**/*.scss",
  jsPath: "./app/js/**/*.js",
};

/**
 * Gulp Tasks are functions that return a node stream that can
 * be 'piped' on
 */

// sass task
const scssTask = () => {
  return src(files.scssPath, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("dist", { sourcemaps: "." }));
};

// js task
const jsTask = () => {
  return src(files.jsPath, { sourcemaps: true })
    .pipe(concat("all.js"))
    .pipe(terser())
    .pipe(dest("dist", { sourcemaps: "." }));
};

// cache busting task
const cacheBustTask = () => {
  const cbString = new Date().getTime();

  return src(["index.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("."));
};

// browsersync tasks
const browsersyncServe = (cb) => {
  browsersync.init({
    server: {
      baseDir: "./",
    },
  });
  cb();
};

const browsersyncReload = (cb) => {
  browsersync.reload();
  cb();
};

// file change watch task
const watchTask = () => {
  watch("*.html", browsersyncReload);
  watch(
    [files.scssPath, files.jsPath],
    series(parallel(scssTask, jsTask, browsersyncReload), cacheBustTask)
  );
};

// default task
exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  browsersyncServe,
  watchTask
);
