
interface ProgressionPreferences {
  strategy: 'lastCompleted' | 'progressive' | 'average';
  autoIncrement: boolean;
  incrementAmount: number;
  confidenceThreshold: number;
}

interface WorkoutPreferences {
  progression: ProgressionPreferences;
  defaultRestTime: number;
  showSuggestions: boolean;
  autoStartRestTimer: boolean;
}

class UserPreferencesService {
  private static instance: UserPreferencesService;
  private preferences: WorkoutPreferences;

  static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): WorkoutPreferences {
    try {
      const stored = localStorage.getItem('workout-preferences');
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('[UserPreferencesService] Error loading preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  private getDefaultPreferences(): WorkoutPreferences {
    return {
      progression: {
        strategy: 'lastCompleted',
        autoIncrement: false,
        incrementAmount: 2.5,
        confidenceThreshold: 0.7
      },
      defaultRestTime: 60,
      showSuggestions: true,
      autoStartRestTimer: true
    };
  }

  getPreferences(): WorkoutPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<WorkoutPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  updateProgressionPreferences(updates: Partial<ProgressionPreferences>): void {
    this.preferences.progression = { ...this.preferences.progression, ...updates };
    this.savePreferences();
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('workout-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('[UserPreferencesService] Error saving preferences:', error);
    }
  }

  getProgressionStrategy(): string {
    return this.preferences.progression.strategy;
  }

  shouldShowSuggestions(): boolean {
    return this.preferences.showSuggestions;
  }

  getConfidenceThreshold(): number {
    return this.preferences.progression.confidenceThreshold;
  }
}

export const userPreferencesService = UserPreferencesService.getInstance();
