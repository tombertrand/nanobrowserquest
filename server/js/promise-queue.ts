class PromiseQueue {
  queue: any[];
  isRunning: boolean;

  constructor() {
    this.queue = [];
    this.isRunning = false;
  }

  enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        resolve,
        reject,
      });

      this.dequeue();
    });
  }

  dequeue() {
    if (this.isRunning) {
      return;
    }

    const item = this.queue.shift();
    if (!item) {
      return;
    }

    this.isRunning = true;
    const { operation, resolve, reject } = item;
    setImmediate(async () => {
      try {
        const value = await operation();
        resolve(value);
      } catch (err) {
        reject(err);
      } finally {
        this.isRunning = false;
        this.dequeue();
      }
    });
  }
}

export { PromiseQueue };
