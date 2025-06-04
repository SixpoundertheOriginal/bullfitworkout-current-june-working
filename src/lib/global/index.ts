
// Global utilities and managers
export { concurrencyManager } from '../concurrency/ConcurrencyManager';
export { cleanupManager } from '@/services/cleanupManager';
export { exerciseCardPool } from '@/services/exerciseCardPool';
export { predictiveCache } from '@/services/predictiveCache';
export { createSearchHook } from '../search/createSearchHook';

// Factory function for creating configured search engines
import { Exercise } from '@/types/exercise';
import { exerciseSearchEngine } from '@/services/exerciseSearchEngine';
import { ConcurrentSearchEngine } from '../search/SearchEngine';
import { concurrencyManager } from '../concurrency/ConcurrencyManager';
import { predictiveCache } from '@/services/predictiveCache';

export const concurrentExerciseSearchEngine = new ConcurrentSearchEngine<Exercise>(
  exerciseSearchEngine,
  concurrencyManager,
  predictiveCache
);
