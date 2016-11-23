const gulp = require('gulp'),
  fs = require('fs'),
  plugins = require('gulp-load-plugins')();


const paths = {
  pug: [ 'pages/index.pug' ],
  pugWatch: [ 'blocks/**/**/*.pug', 'pages/**/**/*.pug', 'includes/**/**/*.pug', 'layouts/**/**/*.pug', 'bower_components/interjacent/**/*.pug' ],
  stylus: 'stylesheets/main.styl',
  stylusWatch: [ 'stylesheets/**/*.styl', 'blocks/**/**/*.styl', 'bower_components/interjacent/blocks/**/*.styl' ],
  copyCss: 'bower_components/normalize-css/normalize.css',
  copyJs: 'blocks/code/js/*.js',
  copyStatic: 'blocks/header/**/*.{eot,woff,ttf,svg}',
  sprite: 'bower_components/interjacent/static/**/**/icon-sprite.png',
  build: 'build/',
  dist: 'dist/'
};


// Compile .jade into .html for development
gulp.task( 'html', () =>
  gulp.src(paths.pug)
    .pipe(plugins.plumber())
    //only pass unchanged *main* files and *all* the partials
    .pipe(plugins.changed( paths.build, {extension: '.html'}))
    //filter out unchanged partials, but it only works when watching
    .pipe(plugins.if(global.isWatching, plugins.cached('pug')))
    //find files that depend on the files that have changed
    .pipe(plugins.jadeInheritance({basedir: 'pages'}))
    //filter out partials (folders and files starting with "_" )
    .pipe(plugins.filter(function (file) {
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    //process jade templates
    .pipe(plugins.pug({
      basedir: './',
      pretty: true
    }))
    //save all the files
    .pipe(gulp.dest( paths.build ))
    .pipe(plugins.connect.reload())
);

// Compile .stylus into .css for development
gulp.task( 'css', () =>
  gulp.src(paths.stylus)
    .pipe(plugins.plumber())
    .pipe(plugins.stylus({
      'include css': true
    }))
    .pipe(gulp.dest(paths.build + 'css/'))
    .pipe(plugins.connect.reload())
);




// Copy javascript files into development build folder
gulp.task( 'copy-js', () =>
  gulp.src( paths.copyJs )
    .pipe(gulp.dest( paths.build + 'js/' ))
);

// Copy stylesheets files into development build folder
gulp.task( 'copy-css', () =>
  gulp.src( paths.copyCss )
    .pipe( gulp.dest( paths.build + 'css/' ))
);

// Copy files from static into development build folder
gulp.task( 'copy-static', () =>
  gulp.src( paths.copyStatic )
    .pipe(gulp.dest( paths.build ))
);

// Copy sprite
gulp.task( 'copy-sprite', () =>
  gulp.src( paths.sprite )
    .pipe(gulp.dest(paths.dist))
);

// Copy files into development build folder
gulp.task('copy', gulp.parallel('copy-js', 'copy-css', 'copy-static', 'copy-sprite'));


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

gulp.task( 'uncss', () =>
  gulp.src( paths.stylus )
    .pipe(plugins.stylus({
      'include css': true
    }))
    .pipe(plugins.uncss({
      html: [ './build/index.html' ]
    }))
    .pipe(gulp.dest( paths.dist + 'css/' ))
);

// CSS minification
gulp.task( 'minify-css', gulp.series('uncss', () =>
  gulp.src([ './dist/css/main.css', 'blocks/code/railscasts.css' ])
    .pipe(plugins.cssnano())
    .pipe(plugins.concat('main.min.css'))
    .pipe(gulp.dest( paths.dist + 'css/' ))
));

// Html minification
gulp.task( 'html-min', gulp.series('minify-css', () =>
  gulp.src( paths.jade )
    .pipe(plugins.plumber())
    .pipe(plugins.pug({
      basedir: './'
    }))
    .pipe(plugins.htmlReplace({
      'css': 'css/main.min.css'
    }))
    // Css from file to inline
    .pipe(plugins.replace(/<link rel="stylesheet" href="css\/main.min.css">/, function(s) {
      var style = fs.readFileSync('dist/css/main.min.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(plugins.htmlmin())
    .pipe(gulp.dest( paths.dist ))
));


// Minify sprite
gulp.task( 'minify-sprite', () =>
  gulp.src( paths.sprite )
    .pipe(plugins.imagemin())
    .pipe(gulp.dest( paths.dist ))
);

// Copy javascript files into development build folder
gulp.task( 'copy-js-to-dist', () =>
  gulp.src( paths.copyJs )
    .pipe(plugins.plumber())
    .pipe(gulp.dest( paths.dist + 'js/' ))
);

// Copy files from static into development build folder
gulp.task( 'copy-static-to-dist', () =>
  gulp.src( paths.copyStatic )
    .pipe(gulp.dest( paths.dist ))
);

// Copy files into dist folder
gulp.task( 'copy-to-dist', gulp.parallel('copy-js-to-dist', 'copy-static-to-dist'));


gulp.task('setWatch', function() {
  global.isWatching = true;
});

// Rerun the task when a file changes
gulp.task( 'watch', gulp.series('setWatch', 'html', function() {
  gulp.watch( paths.pugWatch, [ 'html' ]);
  gulp.watch( paths.stylusWatch, [ 'css' ]);
  gulp.watch( paths.copyJs, [ 'copy-js' ]);
}));

// Run web server
gulp.task( 'connect', function() {
  plugins.connect.server({
    root: paths.build,
    port: 1889,
    livereload: true
  });
});

gulp.task('build', gulp.series('html', 'css', 'copy'));
gulp.task('dist', gulp.series('html-min', 'minify-css', 'copy-to-dist', 'minify-sprite'));

// Deploy to GitHub pages
gulp.task('deploy', gulp.series('dist', () =>
  gulp.src( paths.dist + '/**/*.*' )
    .pipe(plugins.ghPages())
));

gulp.task('default', gulp.series('build', 'connect', 'watch'));
