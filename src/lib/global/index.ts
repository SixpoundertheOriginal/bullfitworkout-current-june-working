
// Global utilities and managers
export { concurrencyManager } from '../concurrency/ConcurrencyManager';
export { cleanupManager } from '@/services/cleanupManager';
export { exerciseCardPool } from '@/services/exerciseCardPool';
export { predictiveCache } from '@/services/predictiveCache';
export { createSearchHook } from '../search/createSearchHook';

// Use the fixed concurrent search engine from services instead of creating a new one
import { concurrentSearchEngine } from '@/services/concurrentSearchEngine';
export { concurrentSearchEngine as concurrentExerciseSearchEngine };
