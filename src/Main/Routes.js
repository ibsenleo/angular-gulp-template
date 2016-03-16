angular.module("MainApp")
.config(function ($stateProvider, $urlRouterProvider) {

    //ROUTES

    $stateProvider

        //LANDING PAGE: Welcome
        .state("main", {
            url: '/main',
            views: {
                'header': {
                    template: '<h1>Header 1</h1>'
                },
                'mainContent': {
                    template: '<div> Esto es el contenido 1 </div>',
                    //controller: 'WelcomeCtrl as wc'
                },
                //'footer': {
                //    template: '<h2>Aquí esta el footer</h2>'
                //}
            }
        })


    $urlRouterProvider.when('', '/main')
});
