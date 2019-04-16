/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

const log = (message: string, ...args: any) =>
  // eslint-disable-next-line no-console
  console.log(`${new Date().toISOString()} [alerts-poc] [task-manager] ${message}`, ...args);

export type TaskId = number;

export class TaskManager {
  private tasks = new Map();
  private taskCounter: TaskId = 0;

  scheduleTask(interval: number, executor: (previousState: Record<string, any>) => void) {
    const taskId = ++this.taskCounter;
    const intervalId = setInterval(async () => await this.runTask(taskId), interval);

    this.tasks.set(taskId, {
      intervalId,
      previousState: {},
      executor,
    });

    log(`Scheduled task to run every ${interval}ms`);
    return taskId;
  }

  async runTask(taskId: TaskId) {
    const task = this.tasks.get(taskId);
    if (task.muted && !(task.mutedUntil < Date.now())) {
      log(`Task ${taskId} is muted, skipping execution`);
      return;
    }
    task.previousState = await task.executor(task.previousState);
  }

  muteTask(taskId: TaskId, duration?: number) {
    const task = this.tasks.get(taskId);
    task.muted = true;
    if (duration) {
      task.mutedUntil = Date.now() + duration;
    }
  }

  unmuteTask(taskId: TaskId) {
    const task = this.tasks.get(taskId);
    task.muted = false;
    task.mutedUntil = null;
  }

  clearTask(taskId: TaskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Cannot find task by id [${taskId}]`);
    }
    clearInterval(task.intervalId);
  }
}
