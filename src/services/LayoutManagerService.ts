
interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface LayoutConfig {
  headerHeight: number;
  footerHeight: number;
  timerPriority: boolean;
  safeAreaHandling: 'auto' | 'manual';
}

class LayoutManagerService {
  private static instance: LayoutManagerService;
  private safeAreaInsets: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  private config: LayoutConfig = {
    headerHeight: 64,
    footerHeight: 80,
    timerPriority: true,
    safeAreaHandling: 'auto'
  };

  static getInstance(): LayoutManagerService {
    if (!LayoutManagerService.instance) {
      LayoutManagerService.instance = new LayoutManagerService();
    }
    return LayoutManagerService.instance;
  }

  private constructor() {
    this.detectSafeArea();
    this.setupViewportListener();
  }

  private detectSafeArea(): void {
    if (typeof window !== 'undefined') {
      const viewport = window.visualViewport;
      const computedStyle = getComputedStyle(document.documentElement);
      
      this.safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
      };
    }
  }

  private setupViewportListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.detectSafeArea());
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.detectSafeArea(), 100);
      });
    }
  }

  getSafeAreaInsets(): SafeAreaInsets {
    return { ...this.safeAreaInsets };
  }

  getTimerTopPosition(): number {
    return this.safeAreaInsets.top + (this.config.timerPriority ? 16 : this.config.headerHeight + 16);
  }

  getContentTopPadding(): number {
    const timerHeight = 120; // Estimated timer component height
    return this.getTimerTopPosition() + timerHeight + 24;
  }

  getLayoutClasses(): Record<string, string> {
    return {
      safeAreaTop: 'pt-safe-top',
      safeAreaBottom: 'pb-safe-bottom',
      safeAreaLeft: 'pl-safe-left',
      safeAreaRight: 'pr-safe-right',
      timerContainer: 'fixed top-safe-top left-0 right-0 z-50',
      contentContainer: `pt-[${this.getContentTopPadding()}px]`,
      headerOverlay: 'absolute top-safe-top left-0 right-0 z-40'
    };
  }

  updateConfig(updates: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export const layoutManagerService = LayoutManagerService.getInstance();
