var gulp    =   require( 'gulp' ),
    sass    =   require( 'gulp-sass' ),
    wiredep =   require( 'wiredep' ).stream,
    inject  =   require( 'gulp-inject' ),
    injstr  =   require( 'gulp-inject-string' ),
    rename  =   require( 'gulp-rename' ),
    argv    =   require( 'yargs' ).argv,
    gutil   =   require( 'gulp-util' ),
    ucc     =   require( 'uppercamelcase' ),
    replace =   require( 'gulp-replace' ),
    bs = require ( 'browser-sync' ).create(),
    runSequence = require('run-sequence');

var paths = {
    src         : './src',
    dist        : './dist',
    templates   :  './templates'
}

var data = {
    file : argv.name,
    uccName : (argv.name) ? ucc(argv.name) : '',
    moduleName : (argv.name) ? ucc(argv.name)+'Module' : '',
    dir: "",
    template : "",
    templateString : 'template_name'
}
gulp.task('inject-vendor', function() {
    gulp.src('./src/index.html')
        .pipe(wiredep({
        //   optional: 'configuration',
        //   goes: 'here'
        }))
        .pipe(gulp.dest('./src'));
});

gulp.task('create-file', function () {
    require('fs').writeFileSync('src/test.html');
});

gulp.task('create:module', function(cb){
    data.targetDir = 'Modules/'+data.uccName+'/';
    data.template = "module.tpl.js";

    if(argv.name !== undefined)
    {
        runSequence('create:files', 'create:ng','create:dependencies',cb);

        gutil.log('Template ' +gutil.colors.cyan(data.uccName+' Module') , 'created in '+ gutil.colors.magenta(paths.src+'/'+data.uccName));
    } else {
        var err = new gutil.PluginError('module-creator','You have to specify a name for the Module')
        throw err;
    }
});

gulp.task('create:factory', function(cb){
    data.targetDir = 'Services/';
    data.template = "factory.tpl.js";

    if(argv.name !== undefined)
    {
        runSequence('create:files', 'create:ng','create:dependencies',cb);

        gutil.log('Template ' +gutil.colors.cyan(data.uccName+' Module') , 'created in '+ gutil.colors.magenta(paths.src+'/'+data.uccName));
    } else {
        var err = new gutil.PluginError('module-creator','You have to specify a name for the Module')
        throw err;
    }
});

//Create files
gulp.task('create:files', function(){
    return gulp.src([paths.templates+'/'+data.template])
        .pipe(replace(data.templateString , data.uccName))
        .pipe(rename(data.file+'.js'))
        .pipe(gulp.dest(paths.src+ '/'+data.targetDir));
    return gulp.src(paths.templates);
})
//Inject module into MainApp
gulp.task('create:ng', function(){
    return gulp.src('src/Main/MainApp.js')
        .pipe(injstr.before('/* endmodules */', 'angular.module("'+data.moduleName+'", []);\n'))
        .pipe(injstr.before('/* endcontrollers */', '"'+data.moduleName+'",\n\t\t'))
        //.pipe(rename('before.html'))
        .pipe(gulp.dest('./src/Main'));
})
//Injecting file into index
gulp.task('create:dependencies', function(){
    return gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src(paths.src+'/'+data.targetDir+'*.js', {read: false}), {starttag: '<!-- inject:modules -->', relative:true}))
        .pipe(gulp.dest(paths.src));
})

// browser-sync task, only cares about compiled CSS

gulp.task('sass', function () {
  return gulp.src(paths.src+'/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.src+'/css'));
    bs.reload;
});

gulp.task('serve', function(){
    bs.init({
      server: {
        baseDir: "./src",
        index: 'index.html',
        routes: {
            "/bower_components": "bower_components"
        }
      }
    });
    gulp.watch('src/**/*.html').on('change', bs.reload);
    gulp.watch('src/**/*.js').on('change', bs.reload);
    gulp.watch('src/**/*.css').on('change', bs.reload);
    gulp.watch('src/**/*.scss', ['sass'])
})



gulp.task('inject:before', function(){
    gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src(paths.src+'/Modules/Test/*.js', {read: false}), {starttag: '<!-- inject:modules -->'}))
        .pipe(gulp.dest(paths.src));
});