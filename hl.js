// node_modules/.bin/babel-node hl.js

import fs from 'fs';

import csvWriter from 'csv-write-stream';
import highland from 'highland';
import JSONStream from 'JSONStream';
import streamqueue from 'streamqueue';

import { mapValues } from 'lodash';


/**
 * The Route
 */
function route(req, res) {
  const { headers } = req.payload;

  streamHits()
    .pick(headers)
    .map(serializeKeys)
    .pipe(csvWriter({ headers, sendHeaders: false }))
    .pipe(res);
}


/**
 * The Hit Stream
 * Give it search params, and it'll give you a stream of hits
 */
function streamHits(params) {
  const initial = makeRequest(params);
  return scrollStreams(initial, id => makeRequest(id));
}


/**
 * The Stream Scroller
 * Give it an initial stream, tell it how to get more streams, and it'll
 * return a single stream of hits.
 */
function scrollStreams(stream, next) {
  const main = streamqueue();
  const scrollHits = justHighland(main);
  const onDeck = streamOnDeck(next);

  scrollHits.on('next_id', id => onDeck.setId(id));
  scrollHits.on('hit', () => onDeck.increment());

  queueAndContinue(stream, () => onDeck.next(), main);

  return scrollHits;
}


/**
 * The Pacer
 * Add the next stream to queue whenever the current stream ends. Finish the
 * queue whenever there are no more streams.
 */
function queueAndContinue(stream, next, queue) {
  stream.on('end', () => {
    const nextStream = next();
    if (nextStream) {
      queueAndContinue(nextStream, next, queue);
    } else {
      queue.done();
    }
  });

  queue.queue(stream);
}


/**
 * Just highland stuff
 */
function justHighland(main) {
  const hl = highland(main);

  const id = hl.observe().pipe(extractScrollId());
  const hits = hl.pipe(extractHits());
  const hlhits = highland(hits);

  highland(id).each(id => hlhits.emit('next_id', id));
  hlhits.observe().each(hit => hlhits.emit('hit', hit));

  return hlhits;
}

/**
 * Next stream based on scroll id and hits
 */
function streamOnDeck(next) {
  return {
    scrollId: undefined,
    total: 0,

    next() {
      if (this.hasNextId()) {
        const id = this.getNextId();
        this.reset();
        return next(id);
      }

      return null;
    },

    setId(id) {
      this.scrollId = id;
    },

    increment() {
      this.total++;
    },

    getNextId() {
      return this.scrollId;
    },

    hasNextId() {
      return this.scrollId !== undefined && this.total;
    },

    reset() {
      this.scrollId = undefined;
      this.total = 0;
    }
  };
}


/**
 * Fake the request/response
 */
route({ payload: { headers: ['@timestamp', 'extension', 'geo'] } }, process.stdout);



function makeRequest(id = '') {
  return fs.createReadStream(`./data${id}.json`);
}

function serializeKeys(obj) {
  return mapValues(obj, val => {
    return typeof val === 'object' ? JSON.stringify(val) : val;
  });
}

function extractHits() {
  return JSONStream.parse('hits.hits.*._source'); // todo: what to do if _source is not stored?
}

function extractScrollId() {
  return JSONStream.parse('_scroll_id');
}
