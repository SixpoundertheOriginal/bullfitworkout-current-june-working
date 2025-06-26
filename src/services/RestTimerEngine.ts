
type TimerTickCallback = (remainingTime: number, isOvertime: boolean, overtimeSeconds: number) => void;
type TimerEndCallback = () => void;

export class RestTimerEngine {
    private intervalId: number | null = null;
    private remainingTime: number = 0; // in seconds
    private targetDuration: number = 0;
    private overtimeSeconds: number = 0;
    private onTick: TimerTickCallback;
    private onEnd: TimerEndCallback;
    public isRunning: boolean = false;
    private isOvertime: boolean = false;

    constructor(onTick: TimerTickCallback, onEnd: TimerEndCallback) {
        this.onTick = onTick;
        this.onEnd = onEnd;
    }

    private tick = () => {
        if (!this.isRunning) return;
        
        if (this.remainingTime > 0) {
            // Normal countdown
            this.remainingTime -= 1;
            this.onTick(this.remainingTime, false, 0);
        } else if (!this.isOvertime) {
            // Just hit zero - trigger completion
            this.isOvertime = true;
            this.onEnd();
            this.overtimeSeconds = 0;
            this.onTick(0, true, 0);
        } else {
            // Overtime counting
            this.overtimeSeconds += 1;
            this.onTick(0, true, this.overtimeSeconds);
        }
    };

    public start = (duration: number) => {
        if (this.isRunning) {
            this.stop(false); // Stop without calling onTick(0) yet
        }
        this.targetDuration = duration;
        this.remainingTime = duration;
        this.overtimeSeconds = 0;
        this.isOvertime = false;
        this.onTick(this.remainingTime, false, 0);
        this.isRunning = true;
        this.intervalId = window.setInterval(this.tick, 1000);
    }

    public stop = (notify: boolean = true) => {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (notify) {
            this.remainingTime = 0;
            this.overtimeSeconds = 0;
            this.isOvertime = false;
            this.onTick(0, false, 0);
        }
    }
    
    public reset = () => {
        this.stop();
        this.remainingTime = this.targetDuration;
        this.overtimeSeconds = 0;
        this.isOvertime = false;
    }

    public getCurrentState = () => ({
        remainingTime: this.remainingTime,
        isOvertime: this.isOvertime,
        overtimeSeconds: this.overtimeSeconds,
        targetDuration: this.targetDuration,
        progress: this.targetDuration > 0 ? ((this.targetDuration - this.remainingTime) / this.targetDuration) * 100 : 0
    });
}
