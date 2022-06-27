interface Operation<T> {
  (): Promise<T>;
}

interface QueueItem<T> {
  operation: Operation<T>;
  resolve: (value: T) => void;
  reject: (err: Error) => void;
}

export class PromiseQueue {
  private readonly queue: QueueItem<unknown>[];
  private isRunning: boolean;
  public results: any[];

  constructor() {
    this.queue = [];
    this.isRunning = false;
    this.results = [];
  }

  public enqueue<T>(operation: Operation<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        operation,
        resolve: resolve as Operation<unknown>,
        reject,
      });

      this.dequeue();
    });
  }

  private dequeue(): void {
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
        this.results.push(value);
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
