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

import { resolve } from 'path';

import { createInitializeContext, createStartCore} from './shim';
import { Plugin } from './plugin';

export default function (kibana) {
  return new kibana.Plugin({
    id: 'interpreter',
    require: ['kibana', 'elasticsearch'],
    publicDir: resolve(__dirname, 'public'),
    uiExports: {
      injectDefaultVars: server => ({ serverBasePath: server.config().get('server.basePath') }),
    },
    async init(server) {
      const initContext = createInitializeContext(server);
      const startCore = createStartCore(server, server.coreStart);
      const startContract = new Plugin(initContext).start(startCore);
      exposeToPlugin(server, startContract);
    },
  });
}


// server/shim.js
export function createInitializeContext(server, core) {
  return core;
}

export function createStartCore(server, core) {
  return {
    ...core,
  };
}

export function exposeToPlugin(server, startContract) {
  for (const x of startContract) {
    server.expose(x);
  }
}


// server/interpreter/index.js
export class Interpreter {
  registries;

  constructor() {
    this.registries = {
      //serverFunctions;
    };
  }
}

// server/plugin.js
export export class Plugin {
  constructor(initializerContext) {
    this.config = initializerContext.config;
    this.intrepreter = new Interpreter();
  }

  start(core, plugins) {
    // this.intrepreter
    core.applications.injectUiAppVars('canvas', () => {
      const config = this.config;
      const basePath = config.get('server.basePath');
      const reportingBrowserType = (() => {
        const configKey = 'xpack.reporting.capture.browser.type';
        if (!config.has(configKey)) return null;
        return config.get(configKey);
      })();

      return {
        kbnIndex: config.get('kibana.index'),
        esShardTimeout: config.get('elasticsearch.shardTimeout'),
        esApiVersion: config.get('elasticsearch.apiVersion'),
        serverFunctions: this.intrepreter.registries.serverFunctions.toArray(),
        basePath,
        reportingBrowserType,
      };
    });

    core.http.route({
      method: 'GET',
      path: '/api/canvas/ast',
      handler: function (request, h) {
        if (!request.query.expression) {
          return h.response({ error: '"expression" query is required' }).code(400);
        }
        return fromExpression(request.query.expression);
      },
    });

    return {
      registries: this.intrepreter.registries,
      register() {
        // push onto this.intrepreter.registries
      }
    };
  }

  stop(core, plugins) {
  }
}

