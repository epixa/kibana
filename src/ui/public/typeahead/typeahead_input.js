import { uiModules } from 'ui/modules';
const typeahead = uiModules.get('kibana/typeahead');

typeahead.directive('kbnTypeaheadInput', function () {
  return {
    restrict: 'A',
    require: '^kbnTypeahead',
    link: function ($scope, $el, $attr, typeahead) {
      // disable browser autocomplete
      $el.attr('autocomplete', 'off');

      // handle keypresses
      $el.on('keydown', function (ev) {
        $scope.$evalAsync(() => typeaheadCtrl.keypressHandler(ev));
      });

      // update focus state based on the input focus state
      $el.on('focus', function () {
        $scope.$evalAsync(() => typeaheadCtrl.setFocused(true));
      });

      $el.on('blur', function () {
        $scope.$evalAsync(() => typeaheadCtrl.setFocused(false));
      });

      $scope.$on('$destroy', () => {
        $el.off();
      });
    }
  };
});
