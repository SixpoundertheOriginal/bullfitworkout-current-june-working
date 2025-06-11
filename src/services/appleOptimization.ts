
interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface AppleDeviceInfo {
  isIOS: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  iosVersion: number | null;
  supportsHaptics: boolean;
  prefersDarkMode: boolean;
}

class AppleOptimizationService {
  private deviceInfo: AppleDeviceInfo;
  private safeAreaInsets: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

  constructor() {
    this.deviceInfo = this.detectAppleDevice();
    this.initializeAppleOptimizations();
  }

  private detectAppleDevice(): AppleDeviceInfo {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIPhone = /iPhone/.test(userAgent);
    
    // Extract iOS version
    const iosVersionMatch = userAgent.match(/OS (\d+)_(\d+)/);
    const iosVersion = iosVersionMatch ? parseInt(iosVersionMatch[1]) : null;
    
    const supportsHaptics = 'vibrate' in navigator && isIOS;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      isIOS,
      isIPad,
      isIPhone,
      iosVersion,
      supportsHaptics,
      prefersDarkMode
    };
  }

  private initializeAppleOptimizations() {
    this.setupSafeAreaInsets();
    this.optimizeForSafari();
    this.setupDarkModeSync();
    this.addAppleTouchIcons();
    this.optimizeForPWA();
    this.setupHapticFeedback();
  }

  private setupSafeAreaInsets() {
    // Monitor safe area changes
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      this.safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
      };
    };

    updateSafeArea();
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);
  }

  private optimizeForSafari() {
    if (!this.deviceInfo.isIOS) return;

    // Disable zoom on input focus
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    // Disable Safari rubber band scrolling
    document.body.style.overscrollBehavior = 'none';

    // Optimize touch targets for iOS
    const style = document.createElement('style');
    style.textContent = `
      .touch-target {
        min-height: 44px;
        min-width: 44px;
      }
      
      .ios-optimized {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .smooth-scroll {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  }

  private setupDarkModeSync() {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      const prefersDark = e.matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      
      // Update theme color for status bar
      let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      
      themeColorMeta.content = prefersDark ? '#1a1a1a' : '#ffffff';
    };

    updateTheme(darkModeQuery);
    darkModeQuery.addListener(updateTheme);
  }

  private addAppleTouchIcons() {
    const iconSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
    
    iconSizes.forEach(size => {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.sizes = `${size}x${size}`;
      link.href = `/icons/apple-touch-icon-${size}x${size}.png`;
      document.head.appendChild(link);
    });

    // Add startup images for different devices
    const startupImages = [
      { media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/launch-1125x2436.png' },
      { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/launch-828x1792.png' },
      { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/launch-1242x2688.png' }
    ];

    startupImages.forEach(({ media, href }) => {
      const link = document.createElement('link');
      link.rel = 'apple-touch-startup-image';
      link.media = media;
      link.href = href;
      document.head.appendChild(link);
    });
  }

  private optimizeForPWA() {
    // Add to homescreen optimization
    const meta1 = document.createElement('meta');
    meta1.name = 'apple-mobile-web-app-capable';
    meta1.content = 'yes';
    document.head.appendChild(meta1);

    const meta2 = document.createElement('meta');
    meta2.name = 'apple-mobile-web-app-status-bar-style';
    meta2.content = 'black-translucent';
    document.head.appendChild(meta2);

    const meta3 = document.createElement('meta');
    meta3.name = 'apple-mobile-web-app-title';
    meta3.content = 'BullFit';
    document.head.appendChild(meta3);
  }

  private setupHapticFeedback() {
    if (!this.deviceInfo.supportsHaptics) return;

    // Haptic feedback utilities
    window.hapticFeedback = {
      light: () => {
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      },
      medium: () => {
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      },
      heavy: () => {
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 10, 30]);
        }
      }
    };
  }

  // Public API
  getSafeAreaInsets(): SafeAreaInsets {
    return { ...this.safeAreaInsets };
  }

  getDeviceInfo(): AppleDeviceInfo {
    return { ...this.deviceInfo };
  }

  triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (window.hapticFeedback) {
      window.hapticFeedback[type]();
    }
  }

  // Battery optimization utilities
  optimizeForBattery() {
    // Reduce animation frequency when battery is low
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateAnimations = () => {
          const shouldReduceAnimations = battery.level < 0.2 || battery.charging === false;
          document.documentElement.classList.toggle('reduce-animations', shouldReduceAnimations);
        };

        battery.addEventListener('levelchange', updateAnimations);
        battery.addEventListener('chargingchange', updateAnimations);
        updateAnimations();
      });
    }
  }
}

// Extend window interface for haptic feedback
declare global {
  interface Window {
    hapticFeedback?: {
      light: () => void;
      medium: () => void;
      heavy: () => void;
    };
  }
}

export const appleOptimization = new AppleOptimizationService();
