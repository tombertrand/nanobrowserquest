import { PromiseQueue } from "./promise-queue";

const queue = new PromiseQueue();

describe("when adding multiple items to the queue", () => {
  it("should all execute in order", done => {
    const results = [];

    for (let i = 0; i <= 10; i++) {
      queue.enqueue(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              results.push(i);
              resolve(i);
            }, Math.floor(Math.random() * 100));
          }),
      );
    }

    setTimeout(() => {
      expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      done();
    }, 3000);
  });
});
