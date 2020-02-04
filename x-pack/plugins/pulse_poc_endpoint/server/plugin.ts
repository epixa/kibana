/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import { CoreSetup } from 'src/core/server';

interface EndpointAlertParams {
  deploymentId: string;
}

export class PulsePocEndpointPlugin {
  public static generateAlert(params: EndpointAlertParams) {
    return {
      '@timestamp': new Date().toISOString(),
      labels: {
        deployment_id: params.deploymentId,
      },
      ecs: {
        version: '1.4.0',
      },
      file: {
        hash: {
          sha1: 'abcd'
        },
        size: 1234,
        path: '',
        owner: '',
        group: '',
      },
      rule: {
        name: 'BAD_BINARY_IS_BAD',
        category: 'Potential malicious binary',
      }
    };
  }

  public async setup(core: CoreSetup) {
    const router = core.http.createRouter();

    router.get(
      {
        path: '/api/endpoint/alert',
        validate: {
          body: schema.object({
            alert_id: schema.string(),
            binary: schema.any(),
          }),
        },
      },
      async (context, request, response) => {
        const { binary } = request.body;
        const es = context.core.elasticsearch.adminClient;

        const alert = PulsePocEndpointPlugin.generateAlert({ deploymentId: '123' });

        const alertDoc = await es.callAsInternalUser('index', {
          index: 'endpoint_alerts',
          body: alert,
        });

        await es.callAsInternalUser('index', {
          index: 'endpoint_alert_binaries',
          body: {
            alert_id: alertDoc._id,
            binary
          },
        });

        return response.ok();
      }
    );
  }

  public start() {}

  public stop() {}
}
