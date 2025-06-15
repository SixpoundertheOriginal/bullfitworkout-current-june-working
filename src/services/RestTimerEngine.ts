
type TimerTickCallback = (remainingTime: number) => void;
type TimerEndCallback = () => void;

export class RestTimerEngine {
    private intervalId: number | null = null;
    private remainingTime: number = 0; // in seconds
    private onTick: TimerTickCallback;
    private onEnd: TimerEndCallback;
    public isRunning: boolean = false;

    constructor(onTick: TimerTickCallback, onEnd: TimerEndCallback) {
        this.onTick = onTick;
        this.onEnd = onEnd;
    }

    private tick = () => {
        if (!this.isRunning) return;
        
        this.remainingTime -= 1;
        this.onTick(this.remainingTime);

        if (this.remainingTime <= 0) {
            this.onEnd();
            this.stop();
        }
    };

    public start = (duration: number) => {
        if (this.isRunning) {
            this.stop(false); // Stop without calling onTick(0) yet
        }
        this.remainingTime = duration;
        this.onTick(this.remainingTime);
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
            this.onTick(0);
        }
    }
    
    public reset = () => {
        this.stop();
    }
}
