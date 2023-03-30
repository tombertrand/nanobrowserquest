class Timer {
  lastTime: any;
  duration: any;

  constructor(duration, startTime = 0) {
    this.lastTime = startTime;
    this.duration = duration;
  }

  isOver(time, isSlowed = false) {
    var over = false;

    if (time - this.lastTime > this.duration * (isSlowed ? 2 : 1)) {
      over = true;
      this.lastTime = time;
    }
    return over;
  }
}

export default Timer;
