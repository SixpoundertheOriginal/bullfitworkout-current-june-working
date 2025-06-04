
import MiniSearch from 'minisearch';
import type { Exercise } from '@/types/exercise';
import { requestDeduplication } from './requestDeduplication';

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
      
      // Ping the worker to check if it's ready
      this.pingWorker();
    } catch (error) {
      console.warn(`Worker initialization attempt ${this.initializationAttempts} failed:`, error);
      this.fallbackToMainThread();
    }
  }

  private pingWorker() {
    if (!this.worker) return;
    
    const timeout = setTimeout(() => {
      console.warn('Worker ping timeout, falling back to main thread');
      this.fallbackToMainThread();
    }, 2000);

    const pingHandler = (event: MessageEvent) => {
      if (event.data.type === 'pong') {
        clearTimeout(timeout);
        this.workerReady = true;
        this.worker?.removeEventListener('message', pingHandler);
        console.log('Worker is ready');
      }
    };

    this.worker.addEventListener('message', pingHandler);
    this.worker.postMessage({ type: 'ping' });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, results, error, requestId, fromWorker } = event.data;
    
    switch (type) {
      case 'searchComplete':
        if (requestId) {
          const pending = this.pendingSearches.get(requestId);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingSearches.delete(requestId);
            pending.resolve(results || []);
          }
        } else {
          // Handle legacy responses without requestId
          this.pendingSearches.forEach(({ resolve }) => {
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
            clearTimeout(pending.timeout);
            this.pendingSearches.delete(requestId);
            // Fallback to main thread for this search
            this.searchInMainThread(pending.resolve, pending.reject);
          }
        } else {
          // Fallback to main thread
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
    
    // Reject all pending searches and retry with main thread
    this.pendingSearches.forEach(({ resolve, reject }) => {
      this.searchInMainThread(resolve, reject);
    });
    this.pendingSearches.clear();
  }

  private searchInMainThread(resolve: (results: Exercise[]) => void, reject: (error: Error) => void) {
    try {
      // This will be implemented by the calling search method
      resolve([]);
    } catch (error) {
      reject(error as Error);
    }
  }

  async indexExercises(exercises: Exercise[]): Promise<void> {
    this.exercises = exercises;
    
    if (this.worker && this.workerReady) {
      // Use worker for indexing
      this.worker.postMessage({
        type: 'index',
        exercises
      });
    } else {
      // Fallback to main thread
      await this.indexInMainThread(exercises);
    }
  }

  private async indexInMainThread(exercises: Exercise[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.miniSearch = new MiniSearch({
          fields: ['name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type'],
          storeFields: ['id', 'name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type', 'difficulty', 'movement_pattern'],
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'AND'
          }
        });

        const documentsToIndex = exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description || '',
          primary_muscle_groups: Array.isArray(exercise.primary_muscle_groups) 
            ? exercise.primary_muscle_groups.join(' ') 
            : '',
          secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) 
            ? exercise.secondary_muscle_groups.join(' ') 
            : '',
          equipment_type: Array.isArray(exercise.equipment_type) 
            ? exercise.equipment_type.join(' ') 
            : '',
          difficulty: exercise.difficulty || '',
          movement_pattern: exercise.movement_pattern || ''
        }));

        this.miniSearch.addAll(documentsToIndex);
        this.isIndexed = true;
        resolve();
      }, 0);
    });
  }

  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    return requestDeduplication.deduplicate(cacheKey, async () => {
      if (!this.isIndexed) {
        return { results: this.exercises, fromCache: false, fromWorker: false };
      }

      let results: Exercise[];
      let fromWorker = false;

      if (this.worker && this.workerReady) {
        // Use worker for search
        try {
          results = await this.searchWithWorker(query, filters, options);
          fromWorker = true;
        } catch (error) {
          console.warn('Worker search failed, falling back to main thread:', error);
          results = this.searchInMainThreadSync(query, filters, options);
        }
      } else {
        // Use main thread search
        results = this.searchInMainThreadSync(query, filters, options);
      }

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
      
      const timeout = setTimeout(() => {
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
      return this.exercises;
    }

    let searchResults: any[] = [];

    if (query.trim()) {
      searchResults = this.miniSearch.search(query, {
        fuzzy: options.fuzzy ?? 0.2,
        prefix: options.prefix ?? true,
        combineWith: options.combineWith ?? 'AND',
        boost: options.boost
      });
    } else {
      searchResults = this.exercises.map(exercise => ({ id: exercise.id }));
    }

    let filteredResults = searchResults.map(result => {
      return this.exercises.find(exercise => exercise.id === result.id);
    }).filter(Boolean) as Exercise[];

    if (Object.keys(filters).length > 0) {
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
    this.pendingSearches.clear();
  }
}

export const exerciseSearchEngine = new ExerciseSearchEngine();
