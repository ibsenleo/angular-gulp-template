var filters = angular.module("MainApp");

    //Filtro para la paginación de carteles en la página principal
filters.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});