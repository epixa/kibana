/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Scheduler } from './scheduler';

export class AlertService {
  constructor() {
    this.alerts = {};
    this.scheduler = new Scheduler();
  }
  register(alert) {
    this.alerts[alert.id] = alert;
  }
  schedule({ id, interval, actions, checkParams }) {
    const alert = this.alerts[id];
    this.scheduler.scheduleTask({
      interval: interval,
      callback: async () => {
        const fire = await alert.check(checkParams);
        if (fire) {
          for (const fireAction of actions) {
            await fireAction();
          }
        }
      },
    });
  }
}
