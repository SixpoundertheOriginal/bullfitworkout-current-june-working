
// Enhanced Search Worker with improved error handling and performance
// Using a more robust search implementation

let searchIndex = null;
let exercises = [];
let isIndexed = false;

// Enhanced search implementation with better scoring
class EnhancedSearch {
  constructor() {
    this.documents = [];
    this.index = new Map();
    this.termFrequency = new Map();
  }

  addAll(documents) {
    this.documents = documents;
    this.buildIndex(documents);
  }

  buildIndex(documents) {
    this.index.clear();
    this.termFrequency.clear();
    
    documents.forEach((doc, docIndex) => {
      const fields = {
        name: doc.name || '',
        description: doc.description || '',
        primary_muscle_groups: Array.isArray(doc.primary_muscle_groups) 
          ? doc.primary_muscle_groups.join(' ') 
          : (doc.primary_muscle_groups || ''),
        secondary_muscle_groups: Array.isArray(doc.secondary_muscle_groups) 
          ? doc.secondary_muscle_groups.join(' ') 
          : (doc.secondary_muscle_groups || ''),
        equipment_type: Array.isArray(doc.equipment_type) 
          ? doc.equipment_type.join(' ') 
          : (doc.equipment_type || ''),
        movement_pattern: doc.movement_pattern || '',
        difficulty: doc.difficulty || ''
      };

      // Create searchable text with field weights
      const searchableText = [
        fields.name,
        fields.description,
        fields.primary_muscle_groups,
        fields.secondary_muscle_groups,
        fields.equipment_type,
        fields.movement_pattern,
        fields.difficulty
      ].join(' ').toLowerCase();

      const words = searchableText.split(/\s+/).filter(word => word.length > 1);
      
      words.forEach(word => {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word).add(docIndex);

        // Track term frequency for scoring
        const termKey = `${word}_${docIndex}`;
        this.termFrequency.set(termKey, (this.termFrequency.get(termKey) || 0) + 1);
      });
    });
  }

  search(query, options = {}) {
    if (!query || !query.trim()) {
      return this.documents.map((doc, index) => ({ ...doc, score: 1 }));
    }

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const matchingDocs = new Map();

    queryWords.forEach(word => {
      // Exact matches (highest score)
      if (this.index.has(word)) {
        this.index.get(word).forEach(docIndex => {
          const termKey = `${word}_${docIndex}`;
          const frequency = this.termFrequency.get(termKey) || 1;
          const current = matchingDocs.get(docIndex) || 0;
          matchingDocs.set(docIndex, current + (frequency * 3));
        });
      }

      // Prefix matches (medium score)
      if (options.prefix !== false) {
        this.index.forEach((docSet, indexedWord) => {
          if (indexedWord.startsWith(word) && indexedWord !== word) {
            docSet.forEach(docIndex => {
              const current = matchingDocs.get(docIndex) || 0;
              matchingDocs.set(docIndex, current + 1.5);
            });
          }
        });
      }

      // Fuzzy matches (low score)
      if (options.fuzzy !== false && word.length > 3) {
        this.index.forEach((docSet, indexedWord) => {
          if (this.isCloseMatch(word, indexedWord)) {
            docSet.forEach(docIndex => {
              const current = matchingDocs.get(docIndex) || 0;
              matchingDocs.set(docIndex, current + 0.5);
            });
          }
        });
      }
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

  isCloseMatch(word1, word2) {
    if (Math.abs(word1.length - word2.length) > 2) return false;
    
    let matches = 0;
    const minLength = Math.min(word1.length, word2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (word1[i] === word2[i]) matches++;
    }
    
    return matches / minLength > 0.7;
  }

  removeAll() {
    this.documents = [];
    this.index.clear();
    this.termFrequency.clear();
  }
}

// Initialize search index
function initializeSearchIndex() {
  try {
    searchIndex = new EnhancedSearch();
    return true;
  } catch (error) {
    console.error('Failed to initialize search index:', error);
    return false;
  }
}

// Index exercises with error handling
function indexExercises(exerciseData) {
  try {
    if (!searchIndex && !initializeSearchIndex()) {
      throw new Error('Failed to initialize search index');
    }
    
    if (!Array.isArray(exerciseData)) {
      throw new Error('Invalid exercise data format');
    }
    
    // Transform exercises for indexing
    const indexableExercises = exerciseData.map(exercise => ({
      id: exercise.id,
      name: exercise.name || '',
      description: exercise.description || '',
      primary_muscle_groups: exercise.primary_muscle_groups || [],
      secondary_muscle_groups: exercise.secondary_muscle_groups || [],
      equipment_type: exercise.equipment_type || [],
      movement_pattern: exercise.movement_pattern || '',
      difficulty: exercise.difficulty || '',
      is_compound: exercise.is_compound || false
    }));
    
    searchIndex.removeAll();
    searchIndex.addAll(indexableExercises);
    exercises = exerciseData;
    isIndexed = true;
    
    self.postMessage({
      type: 'indexComplete',
      exerciseCount: exerciseData.length
    });
  } catch (error) {
    console.error('Indexing error:', error);
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'indexing'
    });
  }
}

// Perform search with enhanced filtering
function performSearch(query, filters = {}, options = {}) {
  try {
    if (!searchIndex || !isIndexed) {
      return [];
    }
    
    let results = searchIndex.search(query, options);
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      results = results.filter(result => {
        const exercise = exercises.find(e => e.id === result.id) || result;
        
        // Muscle group filter
        if (filters.muscleGroup && filters.muscleGroup !== 'all') {
          const primaryMatch = Array.isArray(exercise.primary_muscle_groups) 
            ? exercise.primary_muscle_groups.includes(filters.muscleGroup)
            : exercise.primary_muscle_groups === filters.muscleGroup;
          const secondaryMatch = Array.isArray(exercise.secondary_muscle_groups)
            ? exercise.secondary_muscle_groups.includes(filters.muscleGroup)
            : exercise.secondary_muscle_groups === filters.muscleGroup;
          
          if (!primaryMatch && !secondaryMatch) return false;
        }
        
        // Equipment filter
        if (filters.equipment && filters.equipment !== 'all') {
          const equipmentMatch = Array.isArray(exercise.equipment_type)
            ? exercise.equipment_type.includes(filters.equipment)
            : exercise.equipment_type === filters.equipment;
          
          if (!equipmentMatch) return false;
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
  } catch (error) {
    console.error('Search error:', error);
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'search'
    });
    return [];
  }
}

// Enhanced message handling with validation
self.onmessage = function(e) {
  try {
    const { type, exercises: exerciseData, query, filters, options, requestId } = e.data;
    
    if (!type) {
      throw new Error('Missing message type');
    }
    
    switch (type) {
      case 'index':
        if (!exerciseData) {
          throw new Error('Missing exercise data for indexing');
        }
        indexExercises(exerciseData);
        break;
        
      case 'search':
        const results = performSearch(query || '', filters || {}, options || {});
        self.postMessage({
          type: 'searchComplete',
          results: results,
          requestId: requestId,
          fromWorker: true
        });
        break;
        
      case 'ping':
        self.postMessage({
          type: 'pong',
          isIndexed: isIndexed,
          exerciseCount: exercises.length
        });
        break;
        
      default:
        console.warn('Unknown message type:', type);
        self.postMessage({
          type: 'error',
          error: `Unknown message type: ${type}`,
          operation: 'message-handling'
        });
    }
  } catch (error) {
    console.error('Worker message handling error:', error);
    self.postMessage({
      type: 'error',
      error: error.message,
      operation: 'message-handling'
    });
  }
};

// Initialize when worker starts
try {
  initializeSearchIndex();
  console.log('Search worker initialized successfully');
} catch (error) {
  console.error('Worker initialization failed:', error);
}
