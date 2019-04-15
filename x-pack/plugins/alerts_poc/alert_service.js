/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Scheduler } from './scheduler';

const log = (message) => console.log(`[alerts-poc][alert-service] ${message}`);

export class AlertService {
  constructor(actionService) {
    this.alerts = {};
    this.scheduler = new Scheduler();
    this.actionService = actionService;
  }
  register(alert) {
    this.alerts[alert.id] = alert;
    log(`Registered ${alert.id}`);
  }
  mute(id) {
    this.alerts[id].isMuted = true;
  }
  unmute(id) {
    this.alerts[id].isMuted = false;
  }
  schedule({ id, interval, actions, checkParams }) {
    const alert = this.alerts[id];
    this.scheduler.scheduleTask({
      interval: interval,
      callback: async () => {
        if (alert.isMuted) {
          log(`Skipping check for ${id}, alert is muted`);
          return;
        }
        const fire = await alert.check(checkParams);
        if (fire) {
          log(`Firing actions for ${id}`);
          for (const action of actions) {
            this.actionService.fire(action.id, action.context);
          }
        }
      },
    });
  }
}
