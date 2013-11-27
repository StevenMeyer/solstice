/**
 * A simple Solr wrapper for AngularJS apps
 * @version v0.0.1 - 2013-11-27
 * @link https://github.com/front/solstice
 * @author Élio Cró <elio@front.no>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (ng) {
  'use strict';

  var solr = ng.module('solstice', []);

  /* Solr search service */
  solr.provider('Solstice', function () {
    var endpoint = '';
    return {
      setEndpoint: function (url) {
        endpoint = url;
      },
      $get: function ($http) {
        return {
          search: function(options) {
            var url = endpoint + '/select/';
            var defaults = {
              wt: 'json',
              'json.wrf': 'JSON_CALLBACK'
            };
            ng.extend(defaults, options);
            return $http.jsonp(url, {
              params: defaults
            });
          }
        }
      }
    };
  });

  /* Solr search directive */
  solr.directive('solrSearch', function() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: false,
      template: '<div ng-transclude></div>',
      scope: {
        q: '@query',
        start: '@start',
        rows: '@rows',
        sort: '@sort',
        fl: '@fields'
      },
      controller: function ($scope, $rootScope, Solstice) {
        var options = {
          q: $scope.q || '*:*',
          start: $scope.start || 0,
          rows: $scope.rows || 10
        };
        if($scope.sort) {
          options.order = $scope.sort;
        }
        if($scope.fl) {
          options.fl = $scope.fl;
        }
        console.log(options);

        Solstice.search(options)
        .then(function (data) {
          var res = data.data.response;
          console.log(res);
          var transScope = $scope.$$nextSibling;
          transScope.solr = $rootScope.solr || {};
          transScope.solr.results = res.docs;
          transScope.solr.count = res.numFound;
        });
      }
    };
  });

})(window.angular);
