define(function (require) {
  return function FetchStrategyForSearch(Private, Promise, timefilter) {
    var _ = require('lodash');
    var angular = require('angular');
    var toJson = require('ui/utils/aggressive_parse').toJson;
    var MOCKIT = 'MOCKIT';

    function findCompanion(array, source, predicate) {
      var index = _.findIndex(array, predicate);
      return source[index];
    }

    function shouldBeMocked(req) {
      return req === MOCKIT;
    }

    function prependResponses(responses) {
      return { responses };
    }

    function emptyResponse() {
      return {
        hits: {
          hits: []
        }
      };
    };

    return {
      clientMethod: 'msearch',

      execute: function (requests, fn) {
        // requests that actually need to be sent to the backend
        var actualRequests = _.reject(requests, shouldBeMocked);

        // functions that will return responses in the exact order of requests
        var transforms = requests.map(req => {
          return shouldBeMocked(req)
            ? emptyResponse
            : responses => findCompanion(actualRequests, responses, request => request === req);
        });

        return Promise.try(() => {
          if (actualRequests.length > 0) {
            var body = actualRequests.join('\n') + '\n';
            return fn.call(fn, body).then(this.getResponses);
          }
          return [];
        })
        .then(responses => transforms.map(fn => fn(responses)))
        .then(prependResponses);
      },

      /**
       * Flatten a series of requests into as ES request body
       *
       * @param  {array} requests - the requests to serialize
       * @return {Promise} - a promise that is fulfilled by the request body
       */
      reqsFetchParamsToBody: function (reqsFetchParams) {
        return Promise.map(reqsFetchParams, function (fetchParams) {
          return Promise.resolve(fetchParams.index)
          .then(function (indexList) {
            if (!_.isFunction(_.get(indexList, 'toIndexList'))) {
              return indexList;
            }

            var timeBounds = timefilter.getBounds();
            return indexList.toIndexList(timeBounds.min, timeBounds.max);
          })
          .then(function (indexList) {
            // If we've reached this point and there are no indexes in the
            // index list at all, it means that we shouldn't expect any indexes
            // to contain the documents we're looking for, so we signify that
            // this particular request will need to be mocked.
            if (_.isArray(indexList) && indexList.length === 0) {
              return MOCKIT;
            }
            return angular.toJson({
              index: indexList,
              type: fetchParams.type,
              search_type: fetchParams.search_type,
              ignore_unavailable: true
            })
            + '\n'
            + toJson(fetchParams.body || {}, angular.toJson);
          });
        });
      },

      /**
       * Fetch the multiple responses from the ES Response
       * @param  {object} resp - The response sent from Elasticsearch
       * @return {array} - the list of responses
       */
      getResponses: function (resp) {
        return resp.responses;
      }
    };
  };
});
