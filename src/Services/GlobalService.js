var globalInfo = angular.module("GlobalServiceModule",[]);
//globalInfo.value('URL_SERVICE','wp-admin/admin-ajax.php')
//globalInfo.value('URL_SERVICE','http://stage.inbyt.es/entradas/wp-admin/admin-ajax.php')
//globalInfo.value('URL_SERVICE', 'https://fb.entradasfestival.com/wp-admin/admin-ajax.php');

globalInfo.config([
    '$httpProvider',
    '$provide',
    function ($httpProvider,$provide) {
    //Reset headers to avoid OPTIONS request (aka preflight)
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    //Transforma el objeto JSON en una cadena de parámetros.
    $httpProvider.defaults.transformRequest = function (data) {
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    }

    var getUrlService = function() {

    }
}]);


//User data and login
globalInfo.factory("GlobalFactory",[
    '$rootScope',
    'URL_SERVICE',
    '$http',
    '$q',
    'spinnerService',
    'toastr',
    //'$location',
    '$state',

    function ($rootScope, URL_SERVICE,$http,$q,spinnerService,toastr, $location, $state, $facebook) {

        var _out = {}; //FACTORY RETURN OBJECT


        var init = function () {

            var DOMAIN = $location.host();
            var PROTOCOL = $location.protocol();
            var URL_SERVICE = 'wp-admin/admin-ajax.php';
        }

        //AJAX Calls
        _out.ajax = function(params, spinnerShow){
			if (spinnerShow === undefined)
				spinnerShow = true;

            //Screen locker ON
			if(spinnerShow)
            	spinnerService.show('spinnerGeneral');

            //AJAX call
            return $http.post(AJAX_URL, params)
            .success(function (response) {

                spinnerService.hide('spinnerGeneral');
                return response;
            })
            .error(function (response) {
                spinnerService.hide('spinnerGeneral');
                console.error("Error en la llamada al servidor. Revise la configuración");
            })
        }

        _out.toast = function (message, title,type)
        {
            var toast;
            switch(type)
            {
                case "success":
                    toast = toastr.success;
                break;
                case "error":
                    toast = toastr.error;
                break;
                case "warning":
                    toast = toastr.warning;
                break;
                case "info":
                    toast = toastr.info;
                break;
                default:
                    toast = toastr.success;
                break;
            }
            toast(message, title);
        }

		//ERROR Toast abstraction
		_out.error = function (message)
		{
			//toastr.error(message, "Error");
			console.warn(message);
		}


        //When a call is made, expect an promise object.
        //To avoid do unnecessary calls, this dummy function
        //returns an empty promise
        _out.dummyPromise = function (bEjecutar) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            // success condition
            if (bEjecutar) {

                deferred.resolve('data');

                // error condition
            } else {
                deferred.reject('error');
            }

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            //console.log(promise);
            return promise;
        }

        init()
        return _out;
}]);
