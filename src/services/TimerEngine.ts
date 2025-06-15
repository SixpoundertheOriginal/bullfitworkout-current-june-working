
type TimerCallback = (elapsedTime: number) => void;

export class TimerEngine {
    private rafId: number | null = null;
    private startTime: number = 0;
    private accumulatedElapsedTime: number = 0; // in milliseconds
    
    public isRunning: boolean = false;
    private onTick: TimerCallback;

    constructor(onTick: TimerCallback, initialTime: number = 0) {
        this.onTick = onTick;
        this.accumulatedElapsedTime = initialTime * 1000;
    }

    private tick = () => {
        if (!this.isRunning) return;
        
        const elapsedSinceStart = performance.now() - this.startTime;
        const totalElapsedTime = this.accumulatedElapsedTime + elapsedSinceStart;
        
        const currentSecond = Math.floor(totalElapsedTime / 1000);
        this.onTick(currentSecond);
        
        this.rafId = requestAnimationFrame(this.tick);
    };

    public start = () => {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
    }

    public pause = () => {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        const elapsedSinceStart = performance.now() - this.startTime;
        this.accumulatedElapsedTime += elapsedSinceStart;
    }
    
    public resume = () => {
        this.start();
    }

    public reset = (newInitialTime: number = 0) => {
        this.pause();
        this.accumulatedElapsedTime = newInitialTime * 1000;
        this.onTick(newInitialTime);
    }
}
