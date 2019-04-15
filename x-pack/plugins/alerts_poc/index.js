/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertService } from './alert_service';
import { ActionService } from './action_service';

export function alertsPoc(kibana) {
  return new kibana.Plugin({
    id: 'alerts_poc',
    require: ['kibana', 'elasticsearch'],
    init() {
      const alertService = getAlertService();
      const actionService = getActionService();
      scheduleAlerts(alertService, actionService);
    },
  });
}

function getAlertService() {
  const alertService = new AlertService();
  alertService.register({
    id: 'cpu-check',
    desc: 'Check CPU usage above threshold',
    isMuted: false,
    async check({ theshold }) {
      const cpuUsage = Math.floor(Math.random() * 100);
      return cpuUsage > theshold;
    }
  });
  return alertService;
}

function getActionService() {
  const actionService = new ActionService();
  actionService.register({
    id: 'console-log',
    async fire({ message }) {
      console.log(message);
    },
  });
  return actionService;
}

function scheduleAlerts(alertService, actionService) {
  alertService.schedule({
    id: 'cpu-check',
    interval: 10 * 1000, // 10s
    actions: [
      actionService.createFireFn(
        'console-log',
        { message: 'CPU above 10%' }
      )
    ],
    checkParams: {
      theshold: 10,
    },
  });
}
