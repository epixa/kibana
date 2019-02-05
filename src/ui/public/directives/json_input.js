/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash3';
import angular from 'angular';
import { uiModules } from '../modules';

uiModules
  .get('kibana')
  .directive('jsonInput', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, $el, attrs, ngModelCntrl) {
        ngModelCntrl.$formatters.push(toJSON);
        ngModelCntrl.$parsers.push(fromJSON);

        function fromJSON(value) {
          try {
            value = JSON.parse(value);
            const validity = !scope.$eval(attrs.requireKeys) ? true : _.keys(value).length > 0;
            ngModelCntrl.$setValidity('json', validity);
          } catch (e) {
            ngModelCntrl.$setValidity('json', false);
          }
          return value;
        }

        function toJSON(value) {
          return angular.toJson(value, 2);
        }
      }
    };
  });

