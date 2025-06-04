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
}

interface SearchOptions {
  fuzzy?: boolean;
  prefix?: boolean;
  combineWith?: 'AND' | 'OR';
  boost?: Record<string, number>;
}

class ExerciseSearchEngine {
  private miniSearch: MiniSearch | null = null;
  private exercises: Exercise[] = [];
  private isIndexed = false;
  private worker: Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      this.worker = new Worker('/search-worker.js');
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', (error) => {
        console.error('Search worker error:', error);
      });
    } catch (error) {
      console.warn('Failed to initialize search worker, falling back to main thread:', error);
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, results, error } = event.data;
    
    if (type === 'searchComplete') {
      // Handle search results from worker
      this.resolveSearchPromise(results);
    } else if (type === 'indexComplete') {
      this.isIndexed = true;
    } else if (type === 'error') {
      console.error('Search worker error:', error);
      this.rejectSearchPromise(new Error(error));
    }
  }

  private searchPromiseResolve: ((results: Exercise[]) => void) | null = null;
  private searchPromiseReject: ((error: Error) => void) | null = null;

  private resolveSearchPromise(results: Exercise[]) {
    if (this.searchPromiseResolve) {
      this.searchPromiseResolve(results);
      this.searchPromiseResolve = null;
      this.searchPromiseReject = null;
    }
  }

  private rejectSearchPromise(error: Error) {
    if (this.searchPromiseReject) {
      this.searchPromiseReject(error);
      this.searchPromiseResolve = null;
      this.searchPromiseReject = null;
    }
  }

  async indexExercises(exercises: Exercise[]): Promise<void> {
    this.exercises = exercises;
    
    if (this.worker) {
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
        return { results: this.exercises, fromCache: false };
      }

      let results: Exercise[];
      if (this.worker) {
        // Use worker for search
        results = await new Promise((resolve, reject) => {
          this.searchPromiseResolve = resolve;
          this.searchPromiseReject = reject;
          
          this.worker!.postMessage({
            type: 'search',
            query,
            filters,
            options
          });
        });
      } else {
        // Fallback to main thread search
        results = this.searchInMainThread(query, filters, options);
      }

      return { results, fromCache: false };
    });
  }

  private searchInMainThread(
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
      // If no query, return all indexed documents
      searchResults = this.exercises.map(exercise => ({ id: exercise.id }));
    }

    // Apply filters
    let filteredResults = searchResults.map(result => {
      return this.exercises.find(exercise => exercise.id === result.id);
    }).filter(Boolean) as Exercise[];

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      filteredResults = filteredResults.filter(exercise => {
        return Object.entries(filters).every(([key, value]) => {
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

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.miniSearch = null;
    this.exercises = [];
    this.isIndexed = false;
  }
}

export const exerciseSearchEngine = new ExerciseSearchEngine();
