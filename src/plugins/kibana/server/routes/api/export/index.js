import streamHits from '@elastic/scrollsearch';
import { stringify as toCsv } from 'csv';
import { parse as fromJson } from 'JSONStream';

export default function (server) {
  server.route({
    path: '/api/kibana/export',
    method: 'GET',
    handler: function (req, reply) {
      // todo: compile this from client and actual http request
      const url = 'http://localhost:9201/logstash-*/_search';
      const params = { size: 1000, query: { term: { response: 200 } } };

      // todo: emit original response and handle here?
      // If there were to be an error with the request, the initial response
      // is likely going to have details about that error.
      // We could delay calling reply() until we actually get that response and
      // handle it appropriately.

      const stream = streamHits(url, params)
        .on('error', err => stream.emit('error', err))
        .pipe(fromJson('*'))
        .on('error', err => stream.emit('error', err))
        .pipe(toCsv());

      stream.on('error', (err) => {
        server.log(['error', 'export'], exportError(err));
      });

      return reply(null, stream)
        .header('content-disposition', 'attachment; filename="export.csv"');
    }
  });
};

function exportError(err) {
  const message = `Failed during export:`;
  err.stack = `${message}\n${err.stack}`;
  return err;
}
