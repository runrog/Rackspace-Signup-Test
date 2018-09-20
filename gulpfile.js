const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const browserSync = require('browser-sync');
const autoClose = require('browser-sync-close-hook');
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const ejs = require('gulp-ejs');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const fse = require('fs-extra');
const path = require('path');
const glob = require('glob');
const fetch = require('node-fetch');
const reload = browserSync.reload;

const copyFiles = function copyFiles(files) {
  const copy = (file, dest) => {
    return fse.copy(file, dest, err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Successfully copied file ${file}!`);
    });
  };
  files.forEach((file) => copy(
    file.module,
    `${file.dest}${path.basename(file.module)}`
  ));
}

const buildNodeModules = function buildIcons() {
  const modules = [
    {
      module: './node_modules/jquery/dist/jquery.min.js',
      dest: './dist/js/modules/',
    },
  ];
  fse.ensureDir('./dist/js/modules')
    .then(() => {
      copyFiles(modules);
    })
    .catch(err => {
      console.error(err)
    });
};

const sassTask = function buildSass() {
  // make sure to import all other scss files in main
  return gulp.src('src/styles/main.scss')
    .pipe(sass({ outputStyle: 'compressed' })
    .on('error', sass.logError))
    .pipe(rename('main.min.css'))
    .pipe(autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false,
    }))
    .pipe(gulp.dest('./dist/css'))
    .on('end', () => {
      console.log('Successfully Built SASS');
      browserSync.reload();
    });
};

const jsTask = function buildJS() {
  return gulp.src([
    'src/js/**/*.js',
    '!src/js/**/*.spec.js',
  ])
  .pipe(concat('app.js'))
  .pipe(babel({
    presets: ['env'],
  }))
  .pipe(minify({
    ext: {
      min: '.min.js',
    },
  }))
  .pipe(gulp.dest('dist/js/'))
  .on('end', () => {
    console.log('Successfully Built JS');
  });
};

const getZoolander = function getZoolander() {
  // we can do this because zoolander is public
  const z = 'https://raw.githubusercontent.com/rackerlabs/zoolander/master/dist/'
  const files = [
    'css/main.css',
    'css/global.css',
    'css/derek.css',
    'js/global.js',
    'js/global-components/mainnav/mainnav.js',
    'js/global-components/footer/footer.js',
    'imgs/derek/rs-logo.svg',
    'font/rswebfonts.eot',
    'font/rswebfonts.svg',
    'font/rswebfonts.ttf',
    'font/rswebfonts.woff',
    'font/rswebfonts.woff2',
  ];
  files.forEach((f) => {
    fetch(`${z}${f}`)
      .then(res => {
        const folder = path.dirname(f);
        fse.ensureDir(`./dist/zoolander/${folder}`)
        .then(() => {
          const dest = fse.createWriteStream(`./dist/zoolander/${f}`);
          res.body.pipe(dest);
          console.log(`Successfully added "${f}" from Zoolander`);
        }).catch((e) => {
          console.log(e);
        });
    });
  });
};

const imgTask = function buildImages() {
  return gulp.src('src/images/**/*')
   .pipe(imagemin([
     imagemin.optipng({ optimizationLevel: 5 }),
   ]))
   .pipe(gulp.dest('dist/images'))
   .on('end', () => {
     console.log('Successfully compressed images');
   });
};

const buildEjs = function buildEjs() {
  glob("./src/**/index.ejs", function (er, files) {
    if (er) {
      console.log(er);
      return;
    }
    if (files.length > 0) {
      files.forEach((file) => {
        let dir = path.dirname(file).replace('\.\/src', '');
        dir = dir === '' ? '/' : dir;
        // compile each index file
        gulp.src(file)
         .pipe(ejs({}, {}, { ext: '.html' }))
         .pipe(gulp.dest(`./dist${dir}`))
         .on('end', () => {
           console.log(`Successfully built html for ${dir}!`);
         });
      });
    }
  })
}

const buildDist = function buildDist() {
  return fse.emptyDir('./dist')
  .then(() => {
    buildEjs();
    sassTask();
    jsTask();
    imgTask();
    buildNodeModules();
  });
}

gulp.task('build-sass', sassTask);
gulp.task('build-js', jsTask);
gulp.task('build-images', imgTask);
gulp.task('build-node-modules', buildNodeModules);
gulp.task('build-dist', buildDist);
gulp.task('build-ejs', buildEjs);
gulp.task('build-zoolander', getZoolander);

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.use({
    plugin() {},
    hooks: {
      'client:js': autoClose,
    },
  });
  browserSync({
    proxy: 'localhost:2001',
    port: 2004,
    notify: false,
    ui: false,
  });
});

gulp.task('nodemon', (cb) => {
  let called = false;
  return nodemon({
    script: 'server.js',
    ignore: [
      'gulpfile.js',
      'node_modules/',
    ],
  })
  .on('start', () => {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', () => {
    setTimeout(() => {
      reload({ stream: false });
    }, 1000);
  });
});

gulp.task('default', [
  'build-zoolander',
  'browser-sync',
  'build-sass',
  'build-js',
  'build-images',
  'build-node-modules',
], () => {
  watch([
    '**/*.ejs',
  ], reload);
  gulp.watch([
    'src/styles/**/*.scss',
  ], ['build-sass']);
  gulp.watch([
    'src/images/**/*',
  ], ['build-images']);
  gulp.watch([
    'src/js/**/*.js',
  ], ['build-js']);
});
