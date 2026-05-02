/**
 * Centralized animation controller for managing all animations
 * Provides unified requestAnimationFrame loop with priority management
 */

class AnimationController {
  constructor() {
    this.animations = new Map();
    this.isRunning = false;
    this.animationFrameId = null;
  }

  /**
   * Register an animation with priority
   * @param {string} id - Unique identifier for the animation
   * @param {Function} callback - Animation function to call each frame
   * @param {number} priority - Priority level (higher = runs first)
   */
  register(id, callback, priority = 0) {
    this.animations.set(id, { callback, priority });
    
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Unregister an animation
   * @param {string} id - Animation identifier to remove
   */
  unregister(id) {
    this.animations.delete(id);
    
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.loop();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  loop = () => {
    if (!this.isRunning) return;

    // Sort animations by priority
    const sortedAnimations = Array.from(this.animations.entries())
      .sort((a, b) => b[1].priority - a[1].priority);

    // Execute all registered animations
    sortedAnimations.forEach(([id, { callback }]) => {
      try {
        callback();
      } catch (error) {
        console.error(`Animation ${id} error:`, error);
      }
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}

// Export singleton instance
export const animationController = new AnimationController();
