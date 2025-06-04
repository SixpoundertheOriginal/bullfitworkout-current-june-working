
interface PooledExerciseCard {
  id: string;
  element: HTMLDivElement;
  isInUse: boolean;
  lastUsed: number;
}

class ExerciseCardPool {
  private pool: PooledExerciseCard[] = [];
  private maxPoolSize = 50; // Maximum number of cards to keep in pool
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
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
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    // Remove cards that haven't been used in 5 minutes
    this.pool = this.pool.filter(card => {
      if (!card.isInUse && (now - card.lastUsed) > maxAge) {
        // Remove from DOM if attached
        if (card.element.parentNode) {
          card.element.parentNode.removeChild(card.element);
        }
        return false;
      }
      return true;
    });
  }

  getPoolStats() {
    return {
      totalCards: this.pool.length,
      inUse: this.pool.filter(c => c.isInUse).length,
      available: this.pool.filter(c => !c.isInUse).length
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clean up all cards
    this.pool.forEach(card => {
      if (card.element.parentNode) {
        card.element.parentNode.removeChild(card.element);
      }
    });
    
    this.pool = [];
  }
}

export const exerciseCardPool = new ExerciseCardPool();
