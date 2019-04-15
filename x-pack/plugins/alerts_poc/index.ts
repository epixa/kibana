/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertService } from './alert_service';
import { ActionService } from './action_service';

// eslint-disable-next-line no-console
const log = (message: string, ...args: any) => console.log(`[alerts-poc]${message}`, ...args);

export function alertsPoc(kibana: any) {
  return new kibana.Plugin({
    id: 'alerts_poc',
    require: ['kibana', 'elasticsearch'],
    init() {
      const actionService = getActionService();
      const alertService = getAlertService(actionService);
      scheduleAlerts(alertService);
    },
  });
}

function getAlertService(actionService: ActionService) {
  const alertService = new AlertService(actionService);
  alertService.register({
    id: 'cpu-check',
    desc: 'Check CPU usage above threshold',
    isMuted: false,
    async execute({ fire }, { threshold }) {
      const cpuUsage = Math.floor(Math.random() * 100);

      if (cpuUsage > threshold) {
        fire();
      }
    },
  });
  return alertService;
}

function getActionService() {
  const actionService = new ActionService();
  actionService.register({
    id: 'console-log',
    async fire({ message }) {
      log(`[action][fire] ${message}`);
    },
  });
  return actionService;
}

function scheduleAlerts(alertService: AlertService) {
  alertService.schedule({
    id: 'cpu-check',
    interval: 10 * 1000, // 10s
    actions: [
      {
        id: 'console-log',
        context: { message: 'CPU above 10%' },
      },
    ],
    checkParams: {
      threshold: 10,
    },
  });
}
