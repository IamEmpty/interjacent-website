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
  ghPages = require('gulp-gh-pages'),
  replace = require('gulp-replace'),
  fs = require('fs'),
  jadeInheritance = require('gulp-jade-inheritance'),
  changed = require('gulp-changed'),
  cached = require('gulp-cached');
  gulpif = require('gulp-if'),
  filter = require('gulp-filter'),
  imagemin = require('gulp-imagemin'),
  uncss = require('gulp-uncss'),
  concat = require('gulp-concat');


var paths = {
  jade: [ 'pages/index.jade' ],
  jadeWatch: [ 'blocks/**/**/*.jade', 'pages/**/**/*.jade', 'includes/**/**/*.jade', 'layouts/**/**/*.jade', 'bower_components/interjacent/**/*.jade' ],
  stylus: 'stylesheets/main.styl',
  stylusWatch: [ 'stylesheets/**/*.styl', 'blocks/**/**/*.styl', 'bower_components/interjacent/blocks/**/*.styl' ],
  copyCss: 'bower_components/normalize.css/normalize.css',
  copyJs: 'blocks/code/js/*.js',
  copyStatic: 'blocks/header/**/*.{eot,woff,ttf,svg}',
  sprite: 'bower_components/interjacent/static/**/**/icon-sprite.png',
  build: 'build/',
  dist: 'dist/'
};


// Compile .jade into .html for development
gulp.task( 'html', function() {
  return gulp.src( paths.jade )
    .pipe(plumber())
    //only pass unchanged *main* files and *all* the partials
    .pipe(changed( paths.build, {extension: '.html'}))
    //filter out unchanged partials, but it only works when watching
    .pipe(gulpif(global.isWatching, cached('jade')))
    //find files that depend on the files that have changed
    .pipe(jadeInheritance({basedir: 'pages'}))
    //filter out partials (folders and files starting with "_" )
    .pipe(filter(function (file) {
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    //process jade templates
    .pipe(jade({
      basedir: './',
      pretty: true
    }))
    //save all the files
    .pipe(gulp.dest( paths.build ))
    .pipe(connect.reload());
});

// Compile .stylus into .css for development
gulp.task( 'css', function() {
  return gulp.src( paths.stylus )
    .pipe(plumber())
    .pipe(stylus({
      'include css': true
    }))
    .pipe(gulp.dest( paths.build + 'css/' ))
    .pipe(connect.reload());
});


// Copy files into development build folder
gulp.task( 'copy', [ 'copy-js', 'copy-css', 'copy-static', 'copy-sprite' ]);

  // Copy javascript files into development build folder
  gulp.task( 'copy-js', function() {
    return gulp.src( paths.copyJs )
      .pipe(gulp.dest( paths.build + 'js/' ));
  });

  // Copy stylesheets files into development build folder
  gulp.task( 'copy-css', function() {
    return gulp.src( paths.copyCss )
      .pipe( gulp.dest( paths.build + 'css/' ));
  });

  // Copy files from static into development build folder
  gulp.task( 'copy-static', function() {
    return gulp.src( paths.copyStatic )
      .pipe(gulp.dest( paths.build ));
  });

  // Copy sprite
  gulp.task( 'copy-sprite', function() {
    return gulp.src( paths.sprite )
      .pipe(gulp.dest( paths.dist ));
  });


// Create sprites
// gulp.task( 'sprite', function() {

//   var spriteData =
//     gulp.src( paths.sprite ) // path to images for sprite
//       .pipe(spritesmith({
//         imgName: 'table-sprite.png',
//         imgPath: '#{$img-path}sprites/table-sprite.png',
//         cssName: '_icon-sprite.scss',
//         cssVarMap: function (sprite) {
//           sprite.name = 'icon-' + sprite.name;
//         }
//       }))
//       .pipe(imagemin());

//   spriteData.img.pipe(gulp.dest( 'static/img/sprites' ));     // path for images
//   spriteData.css.pipe(gulp.dest( 'stylesheets/partials' ));   // path for stylesheets
// });


// Perfomance optimization tasks

// Html minification
gulp.task( 'html-min', [ 'minify-css' ], function() {
  return gulp.src( paths.jade )
    .pipe(plumber())
    .pipe(jade({
      basedir: './'
    }))
    .pipe(htmlreplace({
      'css': 'css/main.min.css'
    }))
    // Css from file to inline
    .pipe(replace(/<link rel="stylesheet" href="css\/main.min.css">/, function(s) {
      var style = fs.readFileSync('dist/css/main.min.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(minifyHTML())
    .pipe(gulp.dest( paths.dist ));
});

// CSS minification
gulp.task( 'minify-css', [ 'uncss' ], function() {
  return gulp.src([ './dist/css/main.css', 'blocks/code/railscasts.css' ])
    .pipe(minifyCss())
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest( paths.dist + 'css/' ));
});

gulp.task( 'uncss', function() {
  return gulp.src( paths.stylus )
    .pipe(stylus({
      'include css': true
    }))
    .pipe(uncss({
      html: [ './build/index.html' ]
    }))
    .pipe(gulp.dest( paths.dist + 'css/' ));
});

// Minify sprite
gulp.task( 'minify-sprite', function() {
  return gulp.src( paths.sprite )
    .pipe(imagemin())
    .pipe(gulp.dest( paths.dist ));
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


gulp.task('setWatch', function() {
  global.isWatching = true;
});

// Rerun the task when a file changes
gulp.task( 'watch', [ 'setWatch', 'html' ], function() {
  gulp.watch( paths.jadeWatch, [ 'html' ]);
  gulp.watch( paths.stylusWatch, [ 'css' ]);
  gulp.watch( paths.copyJs, [ 'copy-js' ]);
});


// Run web server
gulp.task( 'connect', function() {
  connect.server({
    root: paths.build,
    port: 1889,
    livereload: true
  });
});


// Deploy to GitHub pages
gulp.task( 'deploy', [ 'dist' ], function() {
  return gulp.src( paths.dist + '/**/*.*' )
    .pipe(ghPages());
});


gulp.task( 'build', [ 'html', 'css', 'copy' ] );
gulp.task( 'dist', [ 'html-min', 'minify-css', 'copy-to-dist', 'minify-sprite' ] );
gulp.task( 'default', [ 'build', 'connect', 'watch' ] );
