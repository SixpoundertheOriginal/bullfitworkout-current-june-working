
// Search Worker for heavy exercise filtering and indexing operations
import { MiniSearch } from 'minisearch';

let searchIndex = null;
let exercises = [];
let isIndexed = false;

// Initialize MiniSearch with exercise-specific configuration
function initializeSearchIndex() {
  searchIndex = new MiniSearch({
    fields: ['name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type', 'movement_pattern', 'difficulty'],
    storeFields: ['id', 'name', 'description', 'primary_muscle_groups', 'secondary_muscle_groups', 'equipment_type', 'movement_pattern', 'difficulty', 'is_compound'],
    searchOptions: {
      boost: { name: 2, primary_muscle_groups: 1.5 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'AND'
    }
  });
}

// Index exercises in the background
function indexExercises(exerciseData) {
  if (!searchIndex) {
    initializeSearchIndex();
  }
  
  // Transform exercises for indexing
  const indexableExercises = exerciseData.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    description: exercise.description || '',
    primary_muscle_groups: exercise.primary_muscle_groups?.join(' ') || '',
    secondary_muscle_groups: exercise.secondary_muscle_groups?.join(' ') || '',
    equipment_type: exercise.equipment_type?.join(' ') || '',
    movement_pattern: exercise.movement_pattern || '',
    difficulty: exercise.difficulty || '',
    is_compound: exercise.is_compound || false
  }));
  
  searchIndex.removeAll();
  searchIndex.addAll(indexableExercises);
  exercises = exerciseData;
  isIndexed = true;
  
  self.postMessage({
    type: 'INDEX_COMPLETE',
    payload: { count: exerciseData.length }
  });
}

// Perform search with ranking
function performSearch(query, filters = {}) {
  if (!searchIndex || !isIndexed) {
    return [];
  }
  
  let results = [];
  
  if (query.trim()) {
    // Perform text search
    results = searchIndex.search(query, {
      boost: { name: 2 },
      fuzzy: 0.2,
      prefix: true
    });
  } else {
    // No query, return all exercises
    results = exercises.map(exercise => ({
      id: exercise.id,
      score: 1,
      ...exercise
    }));
  }
  
  // Apply filters
  if (Object.keys(filters).length > 0) {
    results = results.filter(result => {
      const exercise = exercises.find(e => e.id === result.id) || result;
      
      // Muscle group filter
      if (filters.muscleGroup && filters.muscleGroup !== 'all') {
        const hasMusclGroup = 
          exercise.primary_muscle_groups?.includes(filters.muscleGroup) ||
          exercise.secondary_muscle_groups?.includes(filters.muscleGroup);
        if (!hasMusclGroup) return false;
      }
      
      // Equipment filter
      if (filters.equipment && filters.equipment !== 'all') {
        if (!exercise.equipment_type?.includes(filters.equipment)) return false;
      }
      
      // Difficulty filter
      if (filters.difficulty && filters.difficulty !== 'all') {
        if (exercise.difficulty !== filters.difficulty) return false;
      }
      
      // Movement pattern filter
      if (filters.movement && filters.movement !== 'all') {
        if (exercise.movement_pattern !== filters.movement) return false;
      }
      
      return true;
    });
  }
  
  // Sort by search score (higher is better)
  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  return results;
}

// Handle messages from main thread
self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'INDEX_EXERCISES':
      indexExercises(payload.exercises);
      break;
      
    case 'SEARCH':
      const results = performSearch(payload.query, payload.filters);
      self.postMessage({
        type: 'SEARCH_RESULTS',
        payload: {
          results,
          query: payload.query,
          requestId: payload.requestId
        }
      });
      break;
      
    case 'UPDATE_EXERCISE':
      // Update single exercise in index
      if (searchIndex && isIndexed) {
        const exercise = payload.exercise;
        searchIndex.discard(exercise.id);
        searchIndex.add({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description || '',
          primary_muscle_groups: exercise.primary_muscle_groups?.join(' ') || '',
          secondary_muscle_groups: exercise.secondary_muscle_groups?.join(' ') || '',
          equipment_type: exercise.equipment_type?.join(' ') || '',
          movement_pattern: exercise.movement_pattern || '',
          difficulty: exercise.difficulty || ''
        });
        
        // Update local exercises array
        const index = exercises.findIndex(e => e.id === exercise.id);
        if (index !== -1) {
          exercises[index] = exercise;
        } else {
          exercises.push(exercise);
        }
      }
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};

// Initialize when worker starts
initializeSearchIndex();
