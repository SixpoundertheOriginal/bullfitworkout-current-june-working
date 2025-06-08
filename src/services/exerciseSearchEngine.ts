import MiniSearch from 'minisearch';
import type { Exercise } from '@/types/exercise';
import { networkOptimization } from './networkOptimization';

export interface SearchFilters {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  movement?: string;
}

export interface SearchResult {
  results: Exercise[];
  fromCache?: boolean;
  fromWorker?: boolean;
}

interface SearchOptions {
  fuzzy?: boolean;
  prefix?: boolean;
  combineWith?: 'AND' | 'OR';
  boost?: Record<string, number>;
}

interface PendingSearch {
  resolve: (results: Exercise[]) => void;
  reject: (error: Error) => void;
  timeout: number;
}

class ExerciseSearchEngine {
  private miniSearch: MiniSearch | null = null;
  private exercises: Exercise[] = [];
  private isIndexed = false;
  private worker: Worker | null = null;
  private workerReady = false;
  private pendingSearches: Map<string, PendingSearch> = new Map();
  private requestIdCounter = 0;
  private initializationAttempts = 0;
  private maxInitializationAttempts = 3;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    if (this.initializationAttempts >= this.maxInitializationAttempts) {
      console.warn('Max worker initialization attempts reached, using main thread only');
      return;
    }

    this.initializationAttempts++;
    
    try {
      this.worker = new Worker('/search-worker.js');
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
      
      this.pingWorker();
    } catch (error) {
      console.warn(`Worker initialization attempt ${this.initializationAttempts} failed:`, error);
      this.fallbackToMainThread();
    }
  }

  private pingWorker() {
    if (!this.worker) return;
    
    const timeout = window.setTimeout(() => {
      console.warn('Worker ping timeout, falling back to main thread');
      this.fallbackToMainThread();
    }, 2000);

    const pingHandler = (event: MessageEvent) => {
      if (event.data.type === 'pong') {
        window.clearTimeout(timeout);
        this.workerReady = true;
        this.worker?.removeEventListener('message', pingHandler);
        console.log('Worker is ready');
      }
    };

    this.worker.addEventListener('message', pingHandler);
    this.worker.postMessage({ type: 'ping' });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, results, error, requestId } = event.data;
    
    switch (type) {
      case 'searchComplete':
        if (requestId) {
          const pending = this.pendingSearches.get(requestId);
          if (pending) {
            window.clearTimeout(pending.timeout);
            this.pendingSearches.delete(requestId);
            pending.resolve(results || []);
          }
        } else {
          this.pendingSearches.forEach(({ resolve, timeout }) => {
            window.clearTimeout(timeout);
            resolve(results || []);
          });
          this.pendingSearches.clear();
        }
        break;
        
      case 'indexComplete':
        this.isIndexed = true;
        console.log('Worker indexing complete');
        break;
        
      case 'error':
        console.error('Search worker error:', error);
        if (requestId) {
          const pending = this.pendingSearches.get(requestId);
          if (pending) {
            window.clearTimeout(pending.timeout);
            this.pendingSearches.delete(requestId);
            this.searchInMainThreadAsync(pending.resolve, pending.reject);
          }
        } else {
          this.fallbackToMainThread();
        }
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
    this.fallbackToMainThread();
  }

  private fallbackToMainThread() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerReady = false;
    
    this.pendingSearches.forEach(({ resolve, reject, timeout }) => {
      window.clearTimeout(timeout);
      this.searchInMainThreadAsync(resolve, reject);
    });
    this.pendingSearches.clear();
  }

  private searchInMainThreadAsync(resolve: (results: Exercise[]) => void, reject: (error: Error) => void) {
    try {
      resolve([]);
    } catch (error) {
      reject(error as Error);
    }
  }

  async indexExercises(exercises: Exercise[]): Promise<void> {
    console.log('ExerciseSearchEngine: Indexing', exercises.length, 'exercises');
    this.exercises = exercises;
    
    if (this.worker && this.workerReady) {
      this.worker.postMessage({
        type: 'index',
        exercises
      });
    } else {
      await this.indexInMainThread(exercises);
    }
  }

  private async indexInMainThread(exercises: Exercise[]): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.miniSearch = new MiniSearch({
          fields: ['name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type'],
          storeFields: ['id', 'name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type', 'difficulty', 'movement_pattern'],
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'AND'
          }
        });

        // Fixed: Properly transform exercise data for search indexing
        const documentsToIndex = exercises.map(exercise => {
          const doc = {
            id: exercise.id,
            name: exercise.name || '',
            description: exercise.description || '',
            primary_muscle_groups: Array.isArray(exercise.primary_muscle_groups) 
              ? exercise.primary_muscle_groups.join(' ') 
              : (exercise.primary_muscle_groups || ''),
            secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) 
              ? exercise.secondary_muscle_groups.join(' ') 
              : (exercise.secondary_muscle_groups || ''),
            equipment_type: Array.isArray(exercise.equipment_type) 
              ? exercise.equipment_type.join(' ') 
              : (exercise.equipment_type || ''),
            difficulty: exercise.difficulty || '',
            movement_pattern: exercise.movement_pattern || ''
          };
          
          console.log('Indexing exercise:', doc.name, 'with fields:', {
            name: doc.name,
            primaryMuscles: doc.primary_muscle_groups,
            equipment: doc.equipment_type
          });
          
          return doc;
        });

        this.miniSearch.addAll(documentsToIndex);
        this.isIndexed = true;
        console.log('ExerciseSearchEngine: Main thread indexing complete for', documentsToIndex.length, 'exercises');
        resolve();
      }, 0);
    });
  }

  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    console.log('ExerciseSearchEngine: Starting search for query:', query, 'filters:', filters);
    
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    return networkOptimization.deduplicate(cacheKey, async () => {
      if (!this.isIndexed) {
        console.log('ExerciseSearchEngine: Not indexed yet, returning all exercises');
        return { results: this.exercises, fromCache: false, fromWorker: false };
      }

      let results: Exercise[];
      let fromWorker = false;

      if (this.worker && this.workerReady) {
        try {
          results = await this.searchWithWorker(query, filters, options);
          fromWorker = true;
        } catch (error) {
          console.warn('Worker search failed, falling back to main thread:', error);
          results = this.searchInMainThreadSync(query, filters, options);
        }
      } else {
        results = this.searchInMainThreadSync(query, filters, options);
      }

      console.log('ExerciseSearchEngine: Search completed with', results.length, 'results');
      return { results, fromCache: false, fromWorker };
    });
  }

  private searchWithWorker(
    query: string, 
    filters: SearchFilters, 
    options: SearchOptions
  ): Promise<Exercise[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const requestId = `search-${++this.requestIdCounter}`;
      
      const timeout = window.setTimeout(() => {
        this.pendingSearches.delete(requestId);
        reject(new Error('Search timeout'));
      }, 5000);

      this.pendingSearches.set(requestId, { resolve, reject, timeout });
      
      this.worker.postMessage({
        type: 'search',
        query,
        filters,
        options,
        requestId
      });
    });
  }

  private searchInMainThreadSync(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Exercise[] {
    if (!this.miniSearch) {
      console.log('ExerciseSearchEngine: MiniSearch not initialized, returning original exercises');
      return this.exercises;
    }

    console.log('ExerciseSearchEngine: Performing main thread search for:', query);

    let searchResults: any[] = [];

    if (query.trim()) {
      try {
        searchResults = this.miniSearch.search(query, {
          fuzzy: options.fuzzy ?? 0.2,
          prefix: options.prefix ?? true,
          combineWith: options.combineWith ?? 'AND',
          boost: options.boost
        });
        console.log('ExerciseSearchEngine: MiniSearch returned', searchResults.length, 'raw results');
      } catch (error) {
        console.error('ExerciseSearchEngine: Search error:', error);
        return this.exercises;
      }
    } else {
      // Return all exercises if no query
      searchResults = this.exercises.map(exercise => ({ id: exercise.id }));
      console.log('ExerciseSearchEngine: Empty query, returning all exercises');
    }

    // Map search results back to full exercise objects
    let filteredResults = searchResults.map(result => {
      return this.exercises.find(exercise => exercise.id === result.id);
    }).filter(Boolean) as Exercise[];

    console.log('ExerciseSearchEngine: Mapped to', filteredResults.length, 'exercise objects');

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      const preFilterCount = filteredResults.length;
      filteredResults = filteredResults.filter(exercise => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'all') return true;
          
          switch (key) {
            case 'muscleGroup':
              return exercise.primary_muscle_groups?.includes(value) || 
                     exercise.secondary_muscle_groups?.includes(value);
            case 'equipment':
              return exercise.equipment_type?.includes(value);
            case 'difficulty':
              return exercise.difficulty === value;
            case 'movement':
              return exercise.movement_pattern === value;
            default:
              return true;
          }
        });
      });
      console.log('ExerciseSearchEngine: Filters applied, reduced from', preFilterCount, 'to', filteredResults.length);
    }

    return filteredResults;
  }

  getIndexedStatus(): boolean {
    return this.isIndexed;
  }

  getExerciseCount(): number {
    return this.exercises.length;
  }

  getWorkerStatus(): { ready: boolean; available: boolean } {
    return {
      ready: this.workerReady,
      available: this.worker !== null
    };
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerReady = false;
    this.miniSearch = null;
    this.exercises = [];
    this.isIndexed = false;
    this.pendingSearches.forEach(({ timeout }) => {
      window.clearTimeout(timeout);
    });
    this.pendingSearches.clear();
  }
}

export const exerciseSearchEngine = new ExerciseSearchEngine();
