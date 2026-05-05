/**
 * Performance optimization utilities
 * Handles device detection and automatic quality adjustment
 */

/**
 * Detect if device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
};

/**
 * Detect if device is low-end
 * Based on hardware concurrency and device memory
 */
export const isLowEndDevice = () => {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4;
  
  return cores < 4 || memory < 4 || isMobile();
};

/**
 * Performance Monitor class
 * Tracks FPS and provides quality recommendations
 */
export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.quality = 'high';
  }

  /**
   * Update FPS measurement
   * Call this in your animation loop
   */
  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.fpsHistory.push(this.fps);
      
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = now;
      
      // Update quality based on average FPS
      this.updateQuality();
    }
    
    this.frameCount++;
  }

  /**
   * Get average FPS over last 60 samples
   */
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  /**
   * Update quality level based on performance
   */
  updateQuality() {
    const avgFPS = this.getAverageFPS();
    
    if (avgFPS < 30) {
      this.quality = 'low';
    } else if (avgFPS < 55) {
      this.quality = 'medium';
    } else {
      this.quality = 'high';
    }
  }

  /**
   * Get current quality level
   */
  getQuality() {
    return this.quality;
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded() {
    return this.getAverageFPS() < 55;
  }
}

/**
 * Get recommended quality settings based on device
 */
export const getRecommendedQuality = () => {
  if (isLowEndDevice()) {
    return {
      quality: 'low',
      particleCount: 20,
      enable3D: false,
      enableParallax: false,
      blurAmount: 5
    };
  } else if (isMobile()) {
    return {
      quality: 'medium',
      particleCount: 30,
      enable3D: false,
      enableParallax: true,
      blurAmount: 8
    };
  } else {
    return {
      quality: 'high',
      particleCount: 50,
      enable3D: true,
      enableParallax: true,
      blurAmount: 10
    };
  }
};
