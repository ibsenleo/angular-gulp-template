//Las dependencias se declaran en el modulo principal de la APP
//y luego se inyectan en cada controlador según las necesidades.
/* endmodules */

//MainModule
angular.module("MainApp",
    [
        'ui.router',
        'ui.bootstrap',
        'ngAnimate',
        //'ngSanitize',

        //Services
        'GlobalServiceModule',
        /* endservices*/

        //Controllers
		/* endcontrollers */

    ]
);
