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

import { register } from '@kbn/interpreter/common';
import { initializeInterpreter, registries } from '@kbn/interpreter/public';
import { functions } from './functions';
import { visualization } from './renderers/visualization';



// $KR/plugins/yak/public/index.js
import { getType } from '../../interpreter/public';



// public/index.js
export function getType() {
  // ...
}

const startCore = createStartCore();
const startContract = new Plugin().start(startCore);
exposeToPlugin(startContract);


// public/shim.js
import { kfetch } from 'ui/kfetch';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { core } from 'ui/core';
import { registerServerFunctions } from '../server/routes/server_functions';

export function createStartCore(core) {
  return {
    ...core,
    http: {
      fetch: kfetch
    }
  }
}

export function exposeToPlugin(startContract) {
  EmbeddableFactoriesRegistryProvider.__initNewPlatformContract__(startContract.embeddableFActory);
}

/*
{
  registerSection() {

  }
};
*/


// public/plugin.js
export class CanvasPlugin {
  constructor(initializerContext) {
    this.interpreter;
  }

  start(core) {
    core.applications.registerApplication(async (dom) => {
      const { renderApp } = await core.loader.load('canvas-app.bundle.js');
      renderApp(dom);
    });

    return {

    };


    this.EmbeddableFactoriesRegistryProvider = uiRegistry({
      index: ['name'],
      name: 'embeddableFactories',
    });

    this.intrepreter.register(registries, {
      browserFunctions: functions,
      renderers: [visualization],
    });

    let _resolve;
    let _interpreterPromise;

    const initialize = async () => {
      this.interpreter.initializeInterpreter(core.http.fetch).then(interpreter => {
        _resolve({ interpreter });
      });
    };

    return {
      embeddableFActory: this.EmbeddableFactoriesRegistryProvider,
      async getInterpreter() {
        if (!_interpreterPromise) {
          _interpreterPromise = new Promise(resolve => _resolve = resolve);
          initialize();
        }
        return await _interpreterPromise;
      },

      async interpretAst(...params) {
        const { interpreter } = await getInterpreter();
        return await interpreter.interpretAst(...params);
      }
    };
  }

  stop(core) {
    // called when plugin is torn down, aka window.onbeforeunload
  }
}