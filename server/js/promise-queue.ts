interface Operation<T> {
  (): Promise<T>;
}

interface QueueItem<T> {
  operation: Operation<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export class PromiseQueue {
  private readonly queue: QueueItem<any>[]; // Use 'any' to accommodate different types of operations.
  private isRunning: boolean;
  public results: any[]; // Keeping 'any[]' for results to accommodate different operation result types.

  constructor() {
    this.queue = [];
    this.isRunning = false;
    this.results = [];
  }

  public enqueue<T>(operation: Operation<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        operation,
        resolve, // No need for casting here.
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

    // Replacing 'setImmediate' with 'setTimeout' for broader environment compatibility.
    setTimeout(async () => {
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
    }, 0);
  }
}
