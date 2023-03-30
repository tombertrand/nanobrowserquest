class Transition {
  startValue: number;
  endValue: number;
  startValue1?: number;
  endValue1?: number;
  duration: number;
  inProgress: boolean;
  startTime: any;
  updateFunction: any;
  stopFunction: any;
  count: number;

  constructor() {
    this.startValue = 0;
    this.endValue = 0;
    this.startValue1 = 0;
    this.endValue1 = 0;
    this.duration = 0;
    this.count = 0;
    this.inProgress = false;
  }

  start(currentTime, updateFunction, stopFunction, startValue, endValue, duration, startValue1 = 0, endValue1 = 0) {
    this.startTime = currentTime;
    this.updateFunction = updateFunction;
    this.stopFunction = stopFunction;
    this.startValue = startValue;
    this.endValue = endValue;
    this.startValue1 = startValue1;
    this.endValue1 = endValue1;
    this.duration = duration;
    this.inProgress = true;
    this.count = 0;
  }

  step(currentTime) {
    if (this.inProgress) {
      if (this.count > 0) {
        this.count -= 1;
        console.debug(currentTime + ": jumped frame");
      } else {
        var elapsed = currentTime - this.startTime;

        if (elapsed > this.duration) {
          elapsed = this.duration;
        }

        const diff = this.endValue - this.startValue;
        const i = Math.round(this.startValue + (diff / this.duration) * elapsed);

        let diff1;
        let ii;

        if (this.startValue1 && this.endValue1) {
          diff1 = this.endValue1 - this.startValue1;
          ii = Math.round(this.startValue1 + (diff1 / this.duration) * elapsed);
        }

        if (elapsed === this.duration || i === this.endValue) {
          this.stop();
          this.stopFunction?.();
        } else if (this.updateFunction) {
          this.updateFunction(i, ii);
        }
      }
    }
  }

  restart(currentTime, startValue, endValue) {
    this.start(currentTime, this.updateFunction, this.stopFunction, startValue, endValue, this.duration);
    this.step(currentTime);
  }

  stop() {
    this.inProgress = false;
  }
}

export default Transition;
