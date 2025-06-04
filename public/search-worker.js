
// Search Worker for heavy exercise filtering and indexing operations
// Using importScripts since ES6 modules aren't supported in web workers by default

let searchIndex = null;
let exercises = [];
let isIndexed = false;

// We'll inline a simple search implementation since importing MiniSearch is problematic
class SimpleSearch {
  constructor() {
    this.documents = [];
    this.index = new Map();
  }

  addAll(documents) {
    this.documents = documents;
    this.buildIndex(documents);
  }

  buildIndex(documents) {
    documents.forEach((doc, docIndex) => {
      const searchableText = [
        doc.name,
        doc.description,
        doc.primary_muscle_groups,
        doc.secondary_muscle_groups,
        doc.equipment_type,
        doc.movement_pattern,
        doc.difficulty
      ].join(' ').toLowerCase();

      const words = searchableText.split(/\s+/).filter(word => word.length > 0);
      
      words.forEach(word => {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word).add(docIndex);
      });
    });
  }

  search(query) {
    if (!query.trim()) {
      return this.documents.map((doc, index) => ({ ...doc, score: 1 }));
    }

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const matchingDocs = new Map();

    queryWords.forEach(word => {
      // Exact matches
      if (this.index.has(word)) {
        this.index.get(word).forEach(docIndex => {
          const current = matchingDocs.get(docIndex) || 0;
          matchingDocs.set(docIndex, current + 2);
        });
      }

      // Fuzzy matches (simple prefix matching)
      this.index.forEach((docSet, indexedWord) => {
        if (indexedWord.startsWith(word) && indexedWord !== word) {
          docSet.forEach(docIndex => {
            const current = matchingDocs.get(docIndex) || 0;
            matchingDocs.set(docIndex, current + 1);
          });
        }
      });
    });

    // Convert to results array and sort by score
    const results = Array.from(matchingDocs.entries())
      .map(([docIndex, score]) => ({
        ...this.documents[docIndex],
        score
      }))
      .sort((a, b) => b.score - a.score);

    return results;
  }

  removeAll() {
    this.documents = [];
    this.index.clear();
  }
}

// Initialize search index
function initializeSearchIndex() {
  searchIndex = new SimpleSearch();
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
    type: 'indexComplete'
  });
}

// Perform search with ranking
function performSearch(query, filters = {}) {
  if (!searchIndex || !isIndexed) {
    return [];
  }
  
  let results = searchIndex.search(query);
  
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
  
  return results;
}

// Handle messages from main thread
self.onmessage = function(e) {
  const { type, exercises: exerciseData, query, filters } = e.data;
  
  try {
    switch (type) {
      case 'index':
        indexExercises(exerciseData);
        break;
        
      case 'search':
        const results = performSearch(query, filters);
        self.postMessage({
          type: 'searchComplete',
          results: results
        });
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

// Initialize when worker starts
initializeSearchIndex();
