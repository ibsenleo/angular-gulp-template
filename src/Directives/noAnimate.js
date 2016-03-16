//Desactiva los efectos de animación para los elementos seleccionados
//con el tag, y para todos sus hijos.
angular.module('MainApp')

.directive('noAnimate', function($animate) {
  return {
    restrict : 'AE',
    compile : function(element) {
      $animate.enabled(element,false);
    }
  };
});