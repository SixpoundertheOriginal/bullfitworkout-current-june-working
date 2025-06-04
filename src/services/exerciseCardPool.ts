
import { cleanupManager } from './cleanupManager';

interface PooledExerciseCard {
  id: string;
  element: HTMLDivElement;
  isInUse: boolean;
  lastUsed: number;
}

class ExerciseCardPool {
  private pool: PooledExerciseCard[] = [];
  private maxPoolSize = 50;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Register this pool for global cleanup
    cleanupManager.registerGlobalCleanup(() => this.destroy());
    
    // Clean up unused cards every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  getCard(): PooledExerciseCard | null {
    // Find an unused card from the pool
    const availableCard = this.pool.find(card => !card.isInUse);
    
    if (availableCard) {
      availableCard.isInUse = true;
      availableCard.lastUsed = Date.now();
      return availableCard;
    }

    // If no available card and pool isn't at max size, create new one
    if (this.pool.length < this.maxPoolSize) {
      const newCard = this.createNewCard();
      this.pool.push(newCard);
      return newCard;
    }

    return null; // Pool exhausted
  }

  releaseCard(cardId: string): void {
    const card = this.pool.find(c => c.id === cardId);
    if (card) {
      card.isInUse = false;
      card.lastUsed = Date.now();
      // Clear the card content for reuse
      this.resetCard(card);
    }
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    const beforeSize = this.pool.length;
    
    // Remove cards that haven't been used in 5 minutes
    this.pool = this.pool.filter(card => {
      if (!card.isInUse && (now - card.lastUsed) > maxAge) {
        // Properly remove from DOM and clean up
        this.cleanupCard(card);
        return false;
      }
      return true;
    });

    const afterSize = this.pool.length;
    if (beforeSize !== afterSize) {
      console.log(`ExerciseCardPool cleanup: ${beforeSize} -> ${afterSize} cards`);
    }
  }

  private createNewCard(): PooledExerciseCard {
    const element = document.createElement('div');
    element.className = 'mb-4';
    
    return {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      element,
      isInUse: true,
      lastUsed: Date.now()
    };
  }

  private resetCard(card: PooledExerciseCard): void {
    // Clear any existing content and reset styles
    card.element.innerHTML = '';
    card.element.className = 'mb-4';
    card.element.style.cssText = '';
    
    // Remove any event listeners that might be attached
    const newElement = card.element.cloneNode(false) as HTMLDivElement;
    if (card.element.parentNode) {
      card.element.parentNode.replaceChild(newElement, card.element);
    }
    card.element = newElement;
  }

  private cleanupCard(card: PooledExerciseCard): void {
    // Remove from DOM if attached
    if (card.element.parentNode) {
      card.element.parentNode.removeChild(card.element);
    }
    
    // Clear references to help GC
    card.element.innerHTML = '';
    card.element.remove();
  }

  getPoolStats() {
    return {
      totalCards: this.pool.length,
      inUse: this.pool.filter(c => c.isInUse).length,
      available: this.pool.filter(c => !c.isInUse).length
    };
  }

  destroy(): void {
    console.log('Destroying ExerciseCardPool');
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clean up all cards
    this.pool.forEach(card => this.cleanupCard(card));
    this.pool = [];
  }
}

export const exerciseCardPool = new ExerciseCardPool();
