import streamHits from '@elastic/scrollsearch';

export default function (server) {
  server.route({
    path: '/api/kibana/export',
    method: 'GET',
    handler: function (req, reply) {
      // todo: compile this from client and actual http request
      const url = 'http://localhost:9200/logstash-*/_search';
      const params = { size: 1000, query: { term: { response: 200 } } };

      const stream = streamHits(url, params);
      reply(stream);
    }
  });
};
