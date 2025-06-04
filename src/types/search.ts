
export interface SearchFilters {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  movement?: string;
}

export interface SearchResult<T = any> {
  results: T[];
  fromCache?: boolean;
  fromWorker?: boolean;
}

export interface SearchOptions {
  priority?: 'high' | 'normal' | 'low';
  enableCache?: boolean;
  enablePredictive?: boolean;
  signal?: AbortSignal;
}

export interface SearchEngineInterface<T> {
  search: (query: string, filters?: SearchFilters) => Promise<SearchResult<T>>;
  indexItems?: (items: T[]) => Promise<void>;
  clearCache?: () => void;
  getIndexedStatus?: () => boolean;
  getWorkerStatus?: () => { ready: boolean; available: boolean };
}
