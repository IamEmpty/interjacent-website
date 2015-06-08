var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  spritesmith = require('gulp.spritesmith'),
  jade = require('gulp-jade'),
  connect = require('gulp-connect'),
  stylus = require('gulp-stylus'),
  minifyHTML = require('gulp-minify-html'),
  minifyCss = require('gulp-minify-css'),
  htmlreplace = require('gulp-html-replace'),
  rename = require("gulp-rename"),
  inlinesource = require('gulp-inline-source'),
  ghPages = require('gulp-gh-pages');


var paths = {
  jade: [ 'pages/index.jade' ],
  jadeWatch: [ 'bem-blocks/**/**/*.jade', 'pages/**/**/*.jade', 'includes/**/**/*.jade', 'layouts/**/**/*.jade', 'bower_components/**/**/*.jade' ],
  stylus: [ 'stylesheets/main.styl' ],
  stylusWatch: [ 'stylesheets/**/*.styl', 'blocks/**/**/*.styl', 'bower_components/**/**/**/*.styl' ],
  copyCss: [ 'bower_components/normalize.css/normalize.css' ],
  copyJs: [
    'blocks/code/js/*.js'
  ],
  copyStatic: [
    'static/**/**/**/*.{png,jpg,gif}',
    'static/**/*.{eot,svg,ttf,woff,woff2}',
    'bower_components/axshare-nav/**/*.{ttf,woff,eof,svg,eot}',
    'bower_components/interjacent/static/**/**/icon-sprite.png'
  ],
  build: 'build/',
  dist: 'dist/'
};


// Compile .jade into .html for development
gulp.task( 'html', function() {
  gulp.src( paths.jade )
    .pipe(plumber())
    .pipe(jade({
      basedir: './',
      pretty: true
    }))
    .pipe(gulp.dest( paths.build ));
});

// Compile .stylus into .css for development
gulp.task( 'css', function() {
  gulp.src( paths.stylus )
    .pipe(plumber())
    .pipe(stylus({
      'include css': true
    }))
    .pipe(gulp.dest( paths.build + 'css/' ));
});


// Copy files into development build folder
gulp.task( 'copy', [ 'copy-js', 'copy-css', 'copy-static' ]);

  // Copy javascript files into development build folder
  gulp.task( 'copy-js', function() {
    gulp.src( paths.copyJs )
      .pipe(plumber())
      .pipe(gulp.dest( paths.build + 'js/' ));
  });

  // Copy stylesheets files into development build folder
  gulp.task( 'copy-css', function() {
    gulp.src( paths.copyCss )
      .pipe( gulp.dest( paths.build + 'css/' ));
  });

  // Copy files from static into development build folder
  gulp.task( 'copy-static', function() {
    gulp.src( paths.copyStatic )
      .pipe(gulp.dest( paths.build ));
  });


// Create sprites
gulp.task( 'sprite', function() {

  var spriteData =
    gulp.src( paths.sprite ) // path to images for sprite
      .pipe(spritesmith({
        imgName: 'table-sprite.png',
        imgPath: '#{$img-path}sprites/table-sprite.png',
        cssName: '_icon-sprite.scss',
        cssVarMap: function (sprite) {
          sprite.name = 'icon-' + sprite.name;
        }
      }));

  spriteData.img.pipe(gulp.dest( 'static/img/sprites' ));     // path for images
  spriteData.css.pipe(gulp.dest( 'stylesheets/partials' ));   // path for stylesheets
});


// Optimization tasks

// Html minification
gulp.task( 'html-min', function() {
  return gulp.src( paths.jade )
    .pipe(plumber())
    .pipe(jade({
      basedir: './'
    }))
    .pipe(htmlreplace({
      'css': 'css/main.min.css'
    }))
    .pipe(minifyHTML())
    .pipe(gulp.dest( paths.dist ));
});

// CSS minification
gulp.task( 'minify-css', function() {
  return gulp.src( paths.stylus )
    .pipe(stylus({
      'include css': true
    }))
    .pipe(minifyCss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest( paths.dist + 'css/' ));
});

// Copy files into dist folder
gulp.task( 'copy-to-dist', [ 'copy-js-to-dist', 'copy-static-to-dist' ]);

  // Copy javascript files into development build folder
  gulp.task( 'copy-js-to-dist', function() {
    gulp.src( paths.copyJs )
      .pipe(plumber())
      .pipe(gulp.dest( paths.dist + 'js/' ));
  });

  // Copy files from static into development build folder
  gulp.task( 'copy-static-to-dist', function() {
    gulp.src( paths.copyStatic )
      .pipe(gulp.dest( paths.dist ));
  });


// Rerun the task when a file changes
gulp.task( 'watch', function() {
  gulp.watch( paths.jadeWatch, [ 'html' ]);
  gulp.watch( paths.stylusWatch, [ 'css' ]);
  gulp.watch( paths.copyJs, [ 'copy-js' ]);
});


// Run web server
gulp.task( 'connect', function() {
  connect.server({
    root: paths.build,
    port: 8889
  });
});


// Deploy to GitHub pages
gulp.task( 'deploy', [ 'dist' ], function() {
  return gulp.src( paths.dist + '/**/*.*' )
    .pipe(ghPages());
});


gulp.task( 'build', [ 'html', 'css', 'copy' ] );
gulp.task( 'dist', [ 'html-min', 'minify-css', 'copy-to-dist' ] );
gulp.task( 'default', [ 'build', 'connect', 'watch' ] );
