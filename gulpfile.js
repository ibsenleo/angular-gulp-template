var gulp    =   require( 'gulp' ),
    sass    =   require( 'gulp-sass' ),
    inject  =   require( 'gulp-inject' ),
    injstr  =   require( 'gulp-inject-string' ),
    rename  =   require( 'gulp-rename' ),
    argv    =   require( 'yargs' ).argv,
    gutil   =   require( 'gulp-util' ),
    ucc     =   require( 'uppercamelcase' ),
    replace =   require( 'gulp-replace' ),
    bs      = require ( 'browser-sync' ).create(),
    mainBowerFiles = require('main-bower-files'),
    angularFilesort = require('gulp-angular-filesort'),
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

/**
*   0. Command line tasks
************************************************/
gulp.task('bower:buildlib', function(cb) {
    runSequence('bower:copyfiles', 'bower:jsfiles', 'bower:cssfiles',cb);
})

gulp.task('refresh:files', function(cb){
    runSequence('include:modules','include:directives','include:services','include:styles',cb);
})


gulp.task('create:module', function(cb){
    data.targetDir = (argv['common']) ? 'Common/'+data.uccName+'/' :'Modules/'+data.uccName+'/' ;
    data.template = "module.tpl.js";

    if(argv.name !== undefined)
    {
        runSequence('create:files', 'create:ng','include:modules','include:directives','include:services','include:styles',cb);

        if(argv['with-view'])
            gulp.run('create:view');

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
        runSequence('create:files', 'create:ng','include:modules','include:directives','include:services','include:styles',cb);

        gutil.log('Template ' +gutil.colors.cyan(data.uccName+' Module') , 'created in '+ gutil.colors.magenta(paths.src+'/'+data.uccName));
    } else {
        var err = new gutil.PluginError('module-creator','You have to specify a name for the Module')
        throw err;
    }
});

/**
*   1. Copy bower files into src directory
************************************************/
gulp.task("bower:copyfiles", function(cb){
    gulp.src(mainBowerFiles('**/*.js'))
        .pipe(gulp.dest(paths.src+'/lib/js'))

    gulp.src(mainBowerFiles('**/*.css'))
        .pipe(gulp.dest(paths.src+'/lib/css'))
    cb();
});

gulp.task('bower:cssfiles', function(cb){
    return gulp.src(paths.src+'/index.html')
        //.pipe(inject(gulp.src([paths.src+'/lib/*.js',paths.src+'/lib/*.css' ], {read: false}), {
        .pipe(inject(gulp.src([paths.src+'/lib/**/*.css' ], {read: false}), {
            starttag: '<!-- bower:{{ext}} -->',
            endtag: '<!-- endbower -->',
            relative:true}
        ))
        .pipe(gulp.dest(paths.src));
})

gulp.task('bower:jsfiles', function(cb){
    return gulp.src(paths.src+'/index.html')
        //.pipe(inject(gulp.src([paths.src+'/lib/*.js',paths.src+'/lib/*.css' ], {read: false}), {
        .pipe(inject(
            gulp.src(paths.src+'/lib/**/*.js' , {read: true}).pipe(angularFilesort()), {
                starttag: '<!-- bower:{{ext}} -->',
                endtag: '<!-- endbower -->',
                relative:true}
            )
        )
        .pipe(gulp.dest(paths.src));
})

/**
*   2. Creating & injecting Angular Modules/files
************************************************/
//Create js files
gulp.task('create:files', function(){
    return gulp.src(paths.templates+'/'+data.template)
        .pipe(replace(data.templateString , data.uccName))
        .pipe(rename(data.file+'.ctrl.js'))
        .pipe(gulp.dest(paths.src+ '/'+data.targetDir));
})

//Inject module into MainApp
gulp.task('create:ng', function(){
    return gulp.src(paths.src+'/Main/MainApp.js')
        .pipe(injstr.before('/* endmodules */', 'angular.module("'+data.moduleName+'", []);\n'))
        .pipe(injstr.before('/* endcontrollers */', '"'+data.moduleName+'",\n\t\t'))
        .pipe(gulp.dest('./src/Main'));
})

//creating html view
gulp.task('create:view', function(cb){
    return gulp.src(paths.templates+'/htmltemplate.tpl.html')
        .pipe(replace(data.templateString , data.uccName+'Ctrl'))
        .pipe(rename(data.file+'.tpl.html'))
        .pipe(gulp.dest(paths.src+ '/'+data.targetDir));
})

//Injecting files into index
//Modules
gulp.task('include:modules', function(){
    return gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src([paths.src+'/Modules/**/*.js',paths.src+'/Common/**/*.js'], {read: false}), {starttag: '<!-- inject:modules -->', relative:true}))
        .pipe(gulp.dest(paths.src));
})

//Directives
gulp.task('include:directives', function(){
    return gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src(paths.src+'/Directives/**/*.js', {read: false}), {starttag: '<!-- inject:directives -->', relative:true}))
        .pipe(gulp.dest(paths.src));
})

//Services
gulp.task('include:services', function(){
    return gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src(paths.src+'/Services/**/*.js', {read: false}), {starttag: '<!-- inject:services -->', relative:true}))
        .pipe(gulp.dest(paths.src));
})
//Styles
gulp.task('include:styles', function(){
    return gulp.src(paths.src+'/index.html')
        .pipe(inject(gulp.src(paths.src+'/css/**/*.css', {read: false}), {starttag: '<!-- inject:css -->', relative:true}))
        .pipe(gulp.dest(paths.src));
})

/**
*   3. Compiling SASS
************************************************/
// browser-sync task, only cares about compiled CSS
gulp.task('watch:sass', function(){
    gulp.watch('src/**/*.scss', ['sass'])
});
gulp.task('sass', function () {
  return gulp.src(paths.src+'/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.src+'/css'));
    bs.reload;
});

/**
*   4. Server livereload
************************************************/

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